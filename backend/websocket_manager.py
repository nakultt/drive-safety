from __future__ import annotations

"""
PACER WebSocket Manager
Manages WebSocket connections and broadcasts violation events to dashboard clients.
"""

import json
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections for real-time violation broadcasting."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection silently."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        """Broadcast a message to all connected clients. Remove dead connections silently."""
        dead_connections = []
        message = json.dumps(data, default=str)

        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)

        # Clean up dead connections
        for conn in dead_connections:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

        if dead_connections:
            logger.info(f"Removed {len(dead_connections)} dead WebSocket connections")

    @property
    def connection_count(self) -> int:
        return len(self.active_connections)


# Singleton instance
manager = ConnectionManager()
