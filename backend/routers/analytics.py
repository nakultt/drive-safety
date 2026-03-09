"""
PACER Analytics Router
All analytics aggregation endpoints.
"""

import logging

from fastapi import APIRouter, Query

from services.analytics_service import (
    get_summary,
    get_trends,
    get_by_type,
    get_by_camera,
    get_heatmap,
    get_peak_hours,
    get_hotspots,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
async def analytics_summary():
    """Today/week/month totals, by-type, by-camera, hourly heatmap, top locations."""
    return await get_summary()


@router.get("/trends")
async def analytics_trends(period: str = Query("7d", pattern="^(7d|30d|90d)$")):
    """Daily violation counts for line chart."""
    data = await get_trends(period)
    return {"period": period, "data": data}


@router.get("/by-type")
async def analytics_by_type():
    """Violation counts per type for pie/bar chart."""
    data = await get_by_type()
    return {"data": data}


@router.get("/by-camera")
async def analytics_by_camera():
    """Violation counts per camera."""
    data = await get_by_camera()
    return {"data": data}


@router.get("/heatmap")
async def analytics_heatmap():
    """GPS coordinate weight data for map density layer."""
    data = await get_heatmap()
    return {"data": data}


@router.get("/peak-hours")
async def analytics_peak_hours():
    """Violations grouped by hour of day (0-23)."""
    data = await get_peak_hours()
    return {"data": data}


@router.get("/hotspots")
async def analytics_hotspots():
    """Top 10 GPS clusters with count and dominant violation type."""
    data = await get_hotspots()
    return {"data": data}
