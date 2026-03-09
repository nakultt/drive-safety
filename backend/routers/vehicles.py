"""
PACER Vehicles Router
Vehicle tracking and plate search endpoints.
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from database import vehicles_collection, violations_collection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


def _serialize_vehicle(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("")
async def list_vehicles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List all tracked vehicles sorted by risk_score descending."""
    total = await vehicles_collection.count_documents({})
    skip = (page - 1) * limit

    cursor = vehicles_collection.find().sort("risk_score", -1).skip(skip).limit(limit)
    vehicles = []
    async for doc in cursor:
        vehicles.append(_serialize_vehicle(doc))

    return {"data": vehicles, "total": total, "page": page, "limit": limit}


@router.get("/high-risk")
async def high_risk_vehicles():
    """Get vehicles with risk_score >= 8."""
    cursor = vehicles_collection.find({"risk_score": {"$gte": 8}}).sort("risk_score", -1)
    vehicles = []
    async for doc in cursor:
        vehicles.append(_serialize_vehicle(doc))

    return {"data": vehicles, "total": len(vehicles)}


@router.get("/search")
async def search_vehicles(q: str = Query(..., min_length=1)):
    """Partial plate match using regex."""
    cursor = vehicles_collection.find(
        {"number_plate": {"$regex": q, "$options": "i"}}
    ).sort("risk_score", -1).limit(20)

    vehicles = []
    async for doc in cursor:
        vehicles.append(_serialize_vehicle(doc))

    return {"data": vehicles, "total": len(vehicles)}


@router.get("/{plate}")
async def get_vehicle(plate: str):
    """
    Full vehicle history. Returns vehicle info and all linked violation records.
    """
    vehicle = await vehicles_collection.find_one({"number_plate": plate})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Fetch all linked violations
    violation_ids = vehicle.get("violation_ids", [])
    violations = []
    if violation_ids:
        cursor = violations_collection.find(
            {"violation_id": {"$in": violation_ids}, "deleted": {"$ne": True}}
        ).sort("timestamp", -1)
        async for doc in cursor:
            doc.pop("_id", None)
            violations.append(doc)

    vehicle.pop("_id", None)
    return {"vehicle": vehicle, "violations": violations}
