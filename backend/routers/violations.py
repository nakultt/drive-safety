"""
PACER Violations Router
CRUD endpoints for violation records.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from dateutil.parser import isoparse

from database import violations_collection
from models.violation import ViolationResponse, ViolationListResponse, StatusUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/violations", tags=["Violations"])


def _serialize_violation(doc: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    doc.pop("_id", None)
    return doc


@router.get("", response_model=ViolationListResponse)
async def list_violations(
    violation_type: Optional[str] = Query(None),
    camera_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    plate: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List all violations with filters and pagination."""
    query = {"deleted": {"$ne": True}}

    if violation_type:
        query["violation_type"] = violation_type
    if camera_id:
        query["camera_id"] = camera_id
    if status:
        query["status"] = status
    if plate:
        query["number_plate"] = {"$regex": plate, "$options": "i"}
    if start_date:
        query.setdefault("timestamp", {})["$gte"] = isoparse(start_date)
    if end_date:
        query.setdefault("timestamp", {})["$lte"] = isoparse(end_date)

    total = await violations_collection.count_documents(query)
    skip = (page - 1) * limit

    cursor = violations_collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    violations = []
    async for doc in cursor:
        violations.append(_serialize_violation(doc))

    return {"data": violations, "total": total, "page": page, "limit": limit}


@router.get("/recent")
async def recent_violations(limit: int = Query(10, ge=1, le=50)):
    """Get the latest N violations for live feed."""
    cursor = (
        violations_collection.find({"deleted": {"$ne": True}})
        .sort("timestamp", -1)
        .limit(limit)
    )
    violations = []
    async for doc in cursor:
        violations.append(_serialize_violation(doc))

    return {"data": violations, "total": len(violations)}


@router.get("/{violation_id}")
async def get_violation(violation_id: str):
    """Get a single violation by ID."""
    doc = await violations_collection.find_one({"violation_id": violation_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Violation not found")
    return _serialize_violation(doc)


@router.patch("/{violation_id}/status")
async def update_violation_status(violation_id: str, body: StatusUpdate):
    """Update the status of a violation."""
    valid_statuses = ["pending", "reviewed", "actioned", "dismissed"]
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}",
        )

    result = await violations_collection.update_one(
        {"violation_id": violation_id},
        {"$set": {"status": body.status}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")

    return {"violation_id": violation_id, "status": body.status}


@router.delete("/{violation_id}")
async def delete_violation(violation_id: str):
    """Soft delete a violation."""
    result = await violations_collection.update_one(
        {"violation_id": violation_id},
        {"$set": {"deleted": True}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Violation not found")

    return {"violation_id": violation_id, "deleted": True}
