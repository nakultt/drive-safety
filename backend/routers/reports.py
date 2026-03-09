"""
PACER Reports Router
Report generation (JSON & PDF) and daily digest endpoints.
"""

import io
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from dateutil.parser import isoparse

from database import violations_collection, vehicles_collection
from services.gemini_service import generate_daily_digest
from services.analytics_service import get_today_stats
from services.report_service import generate_pdf_report

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/generate")
async def generate_report(
    start_date: str = Query(...),
    end_date: str = Query(...),
    violation_type: Optional[str] = Query(None),
    format: str = Query("json"),
):
    """Generate a structured JSON report for a date range."""
    try:
        start_dt = isoparse(start_date)
        end_dt = isoparse(end_date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601.")

    query = {
        "deleted": {"$ne": True},
        "timestamp": {"$gte": start_dt, "$lte": end_dt},
    }
    if violation_type:
        query["violation_type"] = violation_type

    total = await violations_collection.count_documents(query)

    # By type
    by_type_cursor = violations_collection.aggregate([
        {"$match": query},
        {"$group": {"_id": "$violation_type", "count": {"$sum": 1}}},
    ])
    by_type = {}
    async for doc in by_type_cursor:
        by_type[doc["_id"]] = doc["count"]

    # By camera
    by_camera_cursor = violations_collection.aggregate([
        {"$match": query},
        {"$group": {"_id": "$camera_id", "count": {"$sum": 1}}},
    ])
    by_camera = {}
    async for doc in by_camera_cursor:
        by_camera[doc["_id"]] = doc["count"]

    # By status
    by_status_cursor = violations_collection.aggregate([
        {"$match": query},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ])
    by_status = {}
    async for doc in by_status_cursor:
        by_status[doc["_id"]] = doc["count"]

    # Top vehicles by risk
    top_vehicles_cursor = vehicles_collection.find().sort("risk_score", -1).limit(10)
    top_vehicles = []
    async for doc in top_vehicles_cursor:
        doc.pop("_id", None)
        top_vehicles.append(doc)

    # Daily counts
    daily_cursor = violations_collection.aggregate([
        {"$match": query},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ])
    daily_counts = []
    async for doc in daily_cursor:
        daily_counts.append({"date": doc["_id"], "count": doc["count"]})

    return {
        "start_date": start_date,
        "end_date": end_date,
        "violation_type": violation_type,
        "total_violations": total,
        "by_type": by_type,
        "by_camera": by_camera,
        "by_status": by_status,
        "top_vehicles": top_vehicles,
        "daily_counts": daily_counts,
    }


@router.post("/generate-pdf")
async def generate_pdf(
    start_date: str = Query(...),
    end_date: str = Query(...),
    violation_type: Optional[str] = Query(None),
):
    """Generate a PDF report and return as file download."""
    # Reuse JSON report logic
    try:
        start_dt = isoparse(start_date)
        end_dt = isoparse(end_date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601.")

    query = {
        "deleted": {"$ne": True},
        "timestamp": {"$gte": start_dt, "$lte": end_dt},
    }
    if violation_type:
        query["violation_type"] = violation_type

    total = await violations_collection.count_documents(query)

    by_type_cursor = violations_collection.aggregate([
        {"$match": query},
        {"$group": {"_id": "$violation_type", "count": {"$sum": 1}}},
    ])
    by_type = {}
    async for doc in by_type_cursor:
        by_type[doc["_id"]] = doc["count"]

    by_status_cursor = violations_collection.aggregate([
        {"$match": query},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ])
    by_status = {}
    async for doc in by_status_cursor:
        by_status[doc["_id"]] = doc["count"]

    top_vehicles_cursor = vehicles_collection.find().sort("risk_score", -1).limit(10)
    top_vehicles = []
    async for doc in top_vehicles_cursor:
        doc.pop("_id", None)
        top_vehicles.append(doc)

    daily_cursor = violations_collection.aggregate([
        {"$match": query},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ])
    daily_counts = []
    async for doc in daily_cursor:
        daily_counts.append({"date": doc["_id"], "count": doc["count"]})

    report_data = {
        "start_date": start_date,
        "end_date": end_date,
        "total_violations": total,
        "by_type": by_type,
        "by_status": by_status,
        "top_vehicles": top_vehicles,
        "daily_counts": daily_counts,
    }

    pdf_buffer = io.BytesIO()
    generate_pdf_report(report_data, pdf_buffer)

    filename = f"pacer_report_{start_date}_to_{end_date}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/daily-digest")
async def daily_digest():
    """Generate today's daily digest using Gemini."""
    stats = await get_today_stats()
    digest_text = generate_daily_digest(stats)

    if not digest_text:
        digest_text = "Daily digest generation is currently unavailable. Please check Gemini API configuration."

    return {
        "digest": digest_text,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
    }
