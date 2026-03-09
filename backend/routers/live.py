"""
PACER Live Router
WebSocket endpoint for real-time violation feed and system status.
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from database import violations_collection, cameras_collection
from websocket_manager import manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Live"])

# Track server start time for uptime calculation
_server_start_time = datetime.now(timezone.utc)


def set_server_start_time(t: datetime):
    global _server_start_time
    _server_start_time = t


@router.websocket("/ws/violations")
async def websocket_violations(websocket: WebSocket):
    """
    WebSocket endpoint for real-time violation updates.
    On connect: send last 10 violations as initial payload.
    Then: broadcast each new violation as it's ingested.
    """
    await manager.connect(websocket)

    try:
        # Send last 10 violations as initial payload
        cursor = (
            violations_collection.find({"deleted": {"$ne": True}})
            .sort("timestamp", -1)
            .limit(10)
        )
        initial = []
        async for doc in cursor:
            doc.pop("_id", None)
            initial.append(doc)

        await websocket.send_json({
            "type": "initial",
            "data": initial,
        })

        # Keep connection alive — new violations are broadcast via manager
        while True:
            # Wait for any message from client (heartbeat/keepalive)
            data = await websocket.receive_text()
            # Echo pong for keepalive
            if data == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@router.get("/api/live/status")
async def live_status():
    """System status: active cameras, recent violations, uptime."""
    now = datetime.now(timezone.utc)

    # Active camera count
    active_cameras = await cameras_collection.count_documents({"is_active": True})

    # Violations in last 1 hour
    one_hour_ago = now - timedelta(hours=1)
    recent_count = await violations_collection.count_documents({
        "deleted": {"$ne": True},
        "timestamp": {"$gte": one_hour_ago},
    })

    # Uptime in seconds
    uptime = (now - _server_start_time).total_seconds()

    return {
        "active_cameras": active_cameras,
        "violations_last_hour": recent_count,
        "uptime_seconds": int(uptime),
        "websocket_connections": manager.connection_count,
    }
