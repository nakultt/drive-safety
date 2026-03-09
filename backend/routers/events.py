"""
PACER Events Router
POST /api/events — primary ingestion endpoint
POST /api/events/batch — batch ingestion for offline queue sync
"""

import base64
import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from dateutil.parser import isoparse

from config import settings
from database import violations_collection, cameras_collection, vehicles_collection
from websocket_manager import manager
from services.gemini_service import extract_number_plate, generate_violation_summary
from services.annotation_service import draw_bounding_boxes, crop_plate_region
from models.violation import EventData, BatchEventRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/events", tags=["Events"])

# Risk scoring weights
RISK_WEIGHTS = {
    "helmet_absence": 1,
    "triple_riding": 2,
    "driver_distraction": 2,
    "wrong_side_driving": 3,
    "overspeeding": 2,
    "pothole": 0,
    "animal_crossing": 0,
}


def _compute_risk(total_score: float) -> str:
    if total_score >= 8:
        return "high"
    elif total_score >= 4:
        return "medium"
    return "low"


async def _process_event(
    image_bytes: bytes,
    event_data: dict,
) -> dict:
    """
    Core processing pipeline for a single violation event.
    Returns the saved violation document.
    """
    violation_id = str(uuid.uuid4())
    timestamp = isoparse(event_data["timestamp"])
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)

    bounding_boxes = event_data.get("bounding_boxes", [])

    # --- Step 1: Deduplication ---
    # We'll check after plate extraction; for now check by camera+type+time window
    dedup_window = now - timedelta(seconds=settings.DEDUP_WINDOW_SECONDS)
    # Quick dedup by camera_id + violation_type within time window
    existing = await violations_collection.find_one({
        "camera_id": event_data["camera_id"],
        "violation_type": event_data["violation_type"],
        "created_at": {"$gte": dedup_window},
    })
    if existing:
        logger.info(f"Deduplicated event: camera={event_data['camera_id']}, type={event_data['violation_type']}")
        return {"status": "deduplicated", "existing_id": existing.get("violation_id")}

    # --- Step 2: Save raw image ---
    date_dir = timestamp.strftime("%Y-%m-%d")
    violations_dir = os.path.join(settings.UPLOAD_DIR, "violations", date_dir)
    os.makedirs(violations_dir, exist_ok=True)

    raw_filename = f"{violation_id}.jpg"
    raw_path = os.path.join(violations_dir, raw_filename)
    with open(raw_path, "wb") as f:
        f.write(image_bytes)
    image_url = f"/uploads/violations/{date_dir}/{raw_filename}"

    # --- Step 3: Draw bounding boxes ---
    annotated_dir = os.path.join(settings.UPLOAD_DIR, "annotated")
    os.makedirs(annotated_dir, exist_ok=True)
    annotated_filename = f"{violation_id}_annotated.jpg"
    annotated_path = os.path.join(annotated_dir, annotated_filename)

    bbox_dicts = [bb if isinstance(bb, dict) else bb.model_dump() for bb in bounding_boxes]
    draw_bounding_boxes(raw_path, annotated_path, bbox_dicts)
    annotated_url = f"/uploads/annotated/{annotated_filename}"

    # --- Step 4: Gemini Vision for number plate ---
    plate_result = extract_number_plate(raw_path)
    number_plate = plate_result.get("plate_number")
    plate_confidence = plate_result.get("confidence", 0.0)
    plate_image_url = None

    if plate_result.get("plate_found") and number_plate:
        plates_dir = os.path.join(settings.UPLOAD_DIR, "plates")
        os.makedirs(plates_dir, exist_ok=True)
        plate_filename = f"{violation_id}_plate.jpg"
        plate_path = os.path.join(plates_dir, plate_filename)
        crop_plate_region(raw_path, plate_path)
        plate_image_url = f"/uploads/plates/{plate_filename}"

        # Re-check deduplication with plate
        plate_dedup = await violations_collection.find_one({
            "number_plate": number_plate,
            "violation_type": event_data["violation_type"],
            "created_at": {"$gte": dedup_window},
        })
        if plate_dedup:
            # Clean up saved files
            for path in [raw_path, annotated_path, plate_path]:
                if os.path.exists(path):
                    os.remove(path)
            logger.info(f"Deduplicated by plate: {number_plate}")
            return {"status": "deduplicated", "existing_id": plate_dedup.get("violation_id")}
    else:
        number_plate = None
        plate_confidence = None

    # --- Step 5: Upsert vehicle record ---
    if number_plate:
        weight = RISK_WEIGHTS.get(event_data["violation_type"], 0)
        vehicle = await vehicles_collection.find_one({"number_plate": number_plate})

        if vehicle:
            new_score = vehicle.get("risk_score", 0) + weight
            violation_types = list(set(vehicle.get("violation_types", []) + [event_data["violation_type"]]))
            violation_ids = vehicle.get("violation_ids", []) + [violation_id]

            await vehicles_collection.update_one(
                {"number_plate": number_plate},
                {
                    "$set": {
                        "last_seen": now,
                        "total_violations": vehicle.get("total_violations", 0) + 1,
                        "violation_types": violation_types,
                        "violation_ids": violation_ids,
                        "risk_score": new_score,
                        "risk_level": _compute_risk(new_score),
                    }
                },
            )
        else:
            new_score = weight
            await vehicles_collection.insert_one({
                "number_plate": number_plate,
                "first_seen": now,
                "last_seen": now,
                "total_violations": 1,
                "violation_types": [event_data["violation_type"]],
                "violation_ids": [violation_id],
                "risk_score": new_score,
                "risk_level": _compute_risk(new_score),
            })

    # --- Step 6: Generate AI summary ---
    summary_data = {
        "violation_type": event_data["violation_type"],
        "number_plate": number_plate,
        "location_label": event_data.get("location_label"),
        "gps_lat": event_data["gps_lat"],
        "gps_lng": event_data["gps_lng"],
        "timestamp": event_data["timestamp"],
        "camera_source": event_data["camera_source"],
        "confidence": event_data["confidence"],
    }
    ai_summary = generate_violation_summary(summary_data)

    # --- Step 7: Build and insert violation document ---
    violation_doc = {
        "violation_id": violation_id,
        "violation_type": event_data["violation_type"],
        "confidence": event_data["confidence"],
        "timestamp": timestamp,
        "camera_source": event_data["camera_source"],
        "camera_id": event_data["camera_id"],
        "gps_lat": event_data["gps_lat"],
        "gps_lng": event_data["gps_lng"],
        "location_label": event_data.get("location_label"),
        "number_plate": number_plate,
        "plate_confidence": plate_confidence,
        "image_path": image_url,
        "annotated_image_path": annotated_url,
        "plate_image_path": plate_image_url,
        "bounding_boxes": bbox_dicts,
        "ai_summary": ai_summary,
        "status": "pending",
        "deleted": False,
        "created_at": now,
    }

    await violations_collection.insert_one(violation_doc)
    logger.info(f"Violation saved: {violation_id} ({event_data['violation_type']})")

    # --- Step 8: Upsert camera record ---
    await cameras_collection.update_one(
        {"camera_id": event_data["camera_id"]},
        {
            "$set": {
                "camera_source": event_data["camera_source"],
                "location_label": event_data.get("location_label"),
                "gps_lat": event_data["gps_lat"],
                "gps_lng": event_data["gps_lng"],
                "last_seen": now,
                "is_active": True,
            },
            "$inc": {"total_violations_detected": 1},
            "$setOnInsert": {"camera_id": event_data["camera_id"]},
        },
        upsert=True,
    )

    # --- Step 9: Broadcast via WebSocket ---
    # Remove MongoDB _id for serialization
    broadcast_doc = {k: v for k, v in violation_doc.items() if k != "_id"}
    await manager.broadcast(broadcast_doc)

    # --- Step 10: Return saved violation ---
    violation_doc.pop("_id", None)
    return violation_doc


@router.post("")
async def ingest_event(
    image: UploadFile = File(...),
    data: str = Form(...),
):
    """
    Primary ingestion endpoint. Receives multipart form data from Pi edge unit.
    """
    try:
        event_data = json.loads(data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in 'data' field")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    result = await _process_event(image_bytes, event_data)
    return result


@router.post("/batch")
async def ingest_batch(request: BatchEventRequest):
    """
    Batch ingestion for offline queue sync from Pi.
    Each event contains a base64 encoded image.
    """
    results = []
    for item in request.events:
        try:
            image_bytes = base64.b64decode(item.image_base64)
            event_data = item.model_dump(exclude={"image_base64"})
            result = await _process_event(image_bytes, event_data)
            results.append({"status": "success", "data": result})
        except Exception as e:
            logger.error(f"Batch item failed: {e}")
            # Save to queue for retry
            queue_dir = os.path.join(settings.UPLOAD_DIR, "queue")
            os.makedirs(queue_dir, exist_ok=True)
            queue_file = os.path.join(queue_dir, f"{uuid.uuid4()}.json")
            with open(queue_file, "w") as f:
                json.dump(item.model_dump(), f, default=str)
            results.append({"status": "failed", "error": str(e)})

    return {"results": results, "total": len(results)}
