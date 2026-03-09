from __future__ import annotations

"""
PACER Analytics Service
MongoDB aggregation pipeline helpers for analytics endpoints.
"""

import logging
from datetime import datetime, timedelta, timezone

from database import violations_collection, cameras_collection, vehicles_collection

logger = logging.getLogger(__name__)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def get_summary() -> dict:
    """Get today/week/month totals, by-type, by-camera, hourly heatmap, top locations."""
    now = _utc_now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    base_filter = {"deleted": {"$ne": True}}

    # Today count
    today_total = await violations_collection.count_documents(
        {**base_filter, "timestamp": {"$gte": today_start}}
    )

    # Week count
    week_total = await violations_collection.count_documents(
        {**base_filter, "timestamp": {"$gte": week_start}}
    )

    # Month count
    month_total = await violations_collection.count_documents(
        {**base_filter, "timestamp": {"$gte": month_start}}
    )

    # By type
    by_type_cursor = violations_collection.aggregate([
        {"$match": base_filter},
        {"$group": {"_id": "$violation_type", "count": {"$sum": 1}}},
    ])
    by_type = {}
    async for doc in by_type_cursor:
        by_type[doc["_id"]] = doc["count"]

    # By camera
    by_camera_cursor = violations_collection.aggregate([
        {"$match": base_filter},
        {"$group": {"_id": "$camera_id", "count": {"$sum": 1}}},
    ])
    by_camera = {}
    async for doc in by_camera_cursor:
        by_camera[doc["_id"]] = doc["count"]

    # 24-hour heatmap (today)
    heatmap_cursor = violations_collection.aggregate([
        {"$match": {**base_filter, "timestamp": {"$gte": today_start}}},
        {"$group": {"_id": {"$hour": "$timestamp"}, "count": {"$sum": 1}}},
    ])
    hourly = [0] * 24
    async for doc in heatmap_cursor:
        hour = doc["_id"]
        if 0 <= hour < 24:
            hourly[hour] = doc["count"]

    # Top 5 locations
    top_locations_cursor = violations_collection.aggregate([
        {"$match": {**base_filter, "location_label": {"$ne": None}}},
        {"$group": {"_id": "$location_label", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ])
    top_locations = []
    async for doc in top_locations_cursor:
        top_locations.append({"location": doc["_id"], "count": doc["count"]})

    return {
        "today_total": today_total,
        "week_total": week_total,
        "month_total": month_total,
        "by_type": by_type,
        "by_camera": by_camera,
        "hourly_heatmap": hourly,
        "top_locations": top_locations,
    }


async def get_trends(period: str) -> list[dict]:
    """Get daily violation counts for the given period (7d, 30d, 90d)."""
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    num_days = days_map.get(period, 7)
    now = _utc_now()
    start = now - timedelta(days=num_days)

    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}, "timestamp": {"$gte": start}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ])

    results = []
    async for doc in cursor:
        results.append({"date": doc["_id"], "count": doc["count"]})

    return results


async def get_by_type() -> list[dict]:
    """Count violations per type."""
    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}}},
        {"$group": {"_id": "$violation_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])

    results = []
    async for doc in cursor:
        results.append({"violation_type": doc["_id"], "count": doc["count"]})
    return results


async def get_by_camera() -> list[dict]:
    """Count violations per camera."""
    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}}},
        {"$group": {"_id": "$camera_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ])

    results = []
    async for doc in cursor:
        results.append({"camera_id": doc["_id"], "count": doc["count"]})
    return results


async def get_heatmap() -> list[dict]:
    """Get GPS coordinate weight data for map density layer."""
    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}}},
        {
            "$group": {
                "_id": {
                    "lat": {"$round": ["$gps_lat", 3]},
                    "lng": {"$round": ["$gps_lng", 3]},
                },
                "weight": {"$sum": 1},
            }
        },
        {"$sort": {"weight": -1}},
    ])

    results = []
    async for doc in cursor:
        results.append({
            "lat": doc["_id"]["lat"],
            "lng": doc["_id"]["lng"],
            "weight": doc["weight"],
        })
    return results


async def get_peak_hours() -> list[dict]:
    """Get violation counts grouped by hour of day (0-23)."""
    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}}},
        {"$group": {"_id": {"$hour": "$timestamp"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ])

    results = []
    async for doc in cursor:
        results.append({"hour": doc["_id"], "count": doc["count"]})
    return results


async def get_hotspots() -> list[dict]:
    """
    Cluster GPS points into 0.001-degree grid cells.
    Return top 10 clusters with count and dominant violation type.
    """
    cursor = violations_collection.aggregate([
        {"$match": {"deleted": {"$ne": True}}},
        {
            "$group": {
                "_id": {
                    "lat": {"$round": ["$gps_lat", 3]},
                    "lng": {"$round": ["$gps_lng", 3]},
                },
                "count": {"$sum": 1},
                "types": {"$push": "$violation_type"},
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ])

    results = []
    async for doc in cursor:
        # Find dominant type
        type_counts = {}
        for t in doc["types"]:
            type_counts[t] = type_counts.get(t, 0) + 1
        dominant = max(type_counts, key=type_counts.get) if type_counts else "unknown"

        results.append({
            "lat": doc["_id"]["lat"],
            "lng": doc["_id"]["lng"],
            "count": doc["count"],
            "dominant_type": dominant,
        })
    return results


async def get_today_stats() -> dict:
    """Get comprehensive stats for today (used for daily digest)."""
    now = _utc_now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    base_filter = {"deleted": {"$ne": True}, "timestamp": {"$gte": today_start}}

    total = await violations_collection.count_documents(base_filter)

    # By type
    by_type_cursor = violations_collection.aggregate([
        {"$match": base_filter},
        {"$group": {"_id": "$violation_type", "count": {"$sum": 1}}},
    ])
    by_type = {}
    async for doc in by_type_cursor:
        by_type[doc["_id"]] = doc["count"]

    # Active cameras today
    active_cameras = await cameras_collection.count_documents({"is_active": True})

    # High risk vehicles
    high_risk_count = await vehicles_collection.count_documents({"risk_score": {"$gte": 8}})

    # Peak hour today
    peak_cursor = violations_collection.aggregate([
        {"$match": base_filter},
        {"$group": {"_id": {"$hour": "$timestamp"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1},
    ])
    peak_hour = None
    async for doc in peak_cursor:
        peak_hour = doc["_id"]

    return {
        "date": today_start.isoformat(),
        "total_violations": total,
        "by_type": by_type,
        "active_cameras": active_cameras,
        "high_risk_vehicles": high_risk_count,
        "peak_hour": peak_hour,
    }
