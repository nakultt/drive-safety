"""
PACER Cameras Router
Camera management and status endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException

from database import cameras_collection, violations_collection
from models.camera import CameraUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cameras", tags=["Cameras"])


def _serialize_camera(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("")
async def list_cameras():
    """List all cameras with is_active status."""
    cursor = cameras_collection.find().sort("last_seen", -1)
    cameras = []
    async for doc in cursor:
        cameras.append(_serialize_camera(doc))

    return {"data": cameras, "total": len(cameras)}


@router.get("/{camera_id}")
async def get_camera(camera_id: str):
    """Camera detail plus last 20 violations from that camera."""
    camera = await cameras_collection.find_one({"camera_id": camera_id})
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Fetch last 20 violations from this camera
    cursor = (
        violations_collection.find(
            {"camera_id": camera_id, "deleted": {"$ne": True}}
        )
        .sort("timestamp", -1)
        .limit(20)
    )
    violations = []
    async for doc in cursor:
        doc.pop("_id", None)
        violations.append(doc)

    camera.pop("_id", None)
    return {"camera": camera, "recent_violations": violations}


@router.patch("/{camera_id}")
async def update_camera(camera_id: str, body: CameraUpdate):
    """Update camera location_label, gps_lat, gps_lng."""
    update_fields = {}
    if body.location_label is not None:
        update_fields["location_label"] = body.location_label
    if body.gps_lat is not None:
        update_fields["gps_lat"] = body.gps_lat
    if body.gps_lng is not None:
        update_fields["gps_lng"] = body.gps_lng

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await cameras_collection.update_one(
        {"camera_id": camera_id},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Camera not found")

    return {"camera_id": camera_id, "updated": update_fields}
