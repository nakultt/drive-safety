"""
PACER Backend — Main Application
FastAPI app initialization with CORS, static files, middleware, startup tasks, and router registration.
"""

import asyncio
import json
import logging
import os
import time
import base64
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import create_indexes, check_connection, cameras_collection
from websocket_manager import manager

from routers import events, violations, vehicles, analytics, cameras, reports, live
from routers.live import set_server_start_time

# ─── Logging Setup ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("pacer")


# ─── Background Tasks ───────────────────────────────────────────────────────────
async def camera_health_monitor():
    """Periodically marks cameras as inactive if not seen recently."""
    threshold_minutes = settings.CAMERA_INACTIVE_THRESHOLD_MINUTES
    while True:
        try:
            cutoff = datetime.now(timezone.utc) - timedelta(minutes=threshold_minutes)
            result = await cameras_collection.update_many(
                {"last_seen": {"$lt": cutoff}, "is_active": True},
                {"$set": {"is_active": False}},
            )
            if result.modified_count > 0:
                logger.info(f"Marked {result.modified_count} camera(s) as inactive")
        except Exception as e:
            logger.error(f"Camera health monitor error: {e}")

        await asyncio.sleep(300)  # Run every 5 minutes


async def process_offline_queue():
    """Process any queued events from failed batch ingestion attempts."""
    queue_dir = os.path.join(settings.UPLOAD_DIR, "queue")
    if not os.path.exists(queue_dir):
        return

    queue_files = [f for f in os.listdir(queue_dir) if f.endswith(".json")]
    if not queue_files:
        return

    logger.info(f"Processing {len(queue_files)} queued events")

    from routers.events import _process_event

    for filename in queue_files:
        filepath = os.path.join(queue_dir, filename)
        try:
            with open(filepath, "r") as f:
                item_data = json.load(f)

            image_bytes = base64.b64decode(item_data.pop("image_base64", ""))
            if image_bytes:
                await _process_event(image_bytes, item_data)

            os.remove(filepath)
            logger.info(f"Processed queued event: {filename}")
        except Exception as e:
            logger.error(f"Failed to process queued event {filename}: {e}")


# ─── App Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    logger.info("Starting PACER backend...")
    set_server_start_time(datetime.now(timezone.utc))

    # Ensure upload directories exist
    for subdir in ["violations", "annotated", "plates", "queue"]:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, subdir), exist_ok=True)

    # Create database indexes
    try:
        await create_indexes()
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

    # Process offline queue
    try:
        await process_offline_queue()
    except Exception as e:
        logger.error(f"Failed to process offline queue: {e}")

    # Start camera health monitor
    health_task = asyncio.create_task(camera_health_monitor())

    logger.info("PACER backend started successfully")
    yield

    # Shutdown
    health_task.cancel()
    try:
        await health_task
    except asyncio.CancelledError:
        pass
    logger.info("PACER backend shut down")


# ─── FastAPI App ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PACER API",
    description="Portable Adaptive Camera-based traffic violation detection system",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Logging Middleware ──────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000  # ms
    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({duration:.1f}ms)"
    )
    return response


# ─── Static Files ────────────────────────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Router Registration ────────────────────────────────────────────────────────
app.include_router(events.router)
app.include_router(violations.router)
app.include_router(vehicles.router)
app.include_router(analytics.router)
app.include_router(cameras.router)
app.include_router(reports.router)
app.include_router(live.router)


# ─── Health Check ────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    db_connected = await check_connection()
    return {
        "status": "ok" if db_connected else "degraded",
        "db": "connected" if db_connected else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
