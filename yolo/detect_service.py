#!/usr/bin/env python3
"""
PACER Pi Detection Service
===========================
Main detection loop that runs on the Raspberry Pi.

Captures frames from the camera, runs YOLO inference, applies violation rules,
and sends detected violations to the PACER backend via POST /api/events.

Usage:
    python detect_service.py

Environment variables (see pi_config.py for all options):
    PACER_BACKEND_URL     — Backend server URL (default: http://localhost:8000)
    PACER_CAMERA_ID       — Unique camera identifier
    PACER_GPS_LAT         — Deployment latitude
    PACER_GPS_LNG         — Deployment longitude
    PACER_LOCATION_LABEL  — Human-readable location name
    PACER_SHOW_PREVIEW    — Show annotated frame window (true/false)
"""

from __future__ import annotations

import json
import logging
import os
import sys
import tempfile
import time
from datetime import datetime, timezone

import cv2
import requests
from ultralytics import YOLO  # type: ignore

import pi_config as cfg
from violation_rules import analyze_detections
from offline_queue import save_to_queue, flush_queue, queue_size

# ─── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("pacer.detect")

# ─── Cooldown Tracker ────────────────────────────────────────────────────────────
# Tracks last send time per violation_type to avoid flooding
_last_sent: dict[str, float] = {}


def _is_on_cooldown(violation_type: str) -> bool:
    """Check if this violation type was sent too recently."""
    last = _last_sent.get(violation_type, 0)
    return (time.time() - last) < cfg.COOLDOWN_SECONDS


def _mark_sent(violation_type: str):
    _last_sent[violation_type] = time.time()


def _send_to_backend(image_path: str, event_data: dict) -> bool:
    """
    Send a violation event to the PACER backend.
    Returns True on success, False on failure (event is queued).
    """
    try:
        with open(image_path, "rb") as img_file:
            files = {"image": ("frame.jpg", img_file, "image/jpeg")}
            data = {"data": json.dumps(event_data, default=str)}

            response = requests.post(
                cfg.EVENTS_ENDPOINT,
                files=files,
                data=data,
                timeout=15,
            )

        if response.status_code == 200:
            result = response.json()
            status = result.get("status", "")
            if status == "deduplicated":
                logger.info(f"  → Deduplicated by backend")
            else:
                vid = result.get("violation_id", "?")
                logger.info(f"  → Sent OK (violation_id: {vid})")
            return True
        else:
            logger.warning(f"  → Backend returned HTTP {response.status_code}")
            save_to_queue(image_path, event_data)
            return False

    except requests.ConnectionError:
        logger.warning(f"  → Backend unreachable, saving to offline queue")
        save_to_queue(image_path, event_data)
        return False
    except Exception as e:
        logger.error(f"  → Send failed: {e}")
        save_to_queue(image_path, event_data)
        return False


def run_detection_loop():
    """Main detection loop — capture frames, run YOLO, send violations."""
    # Load YOLO model
    logger.info(f"Loading YOLO model from {cfg.MODEL_PATH}...")
    model = YOLO(cfg.MODEL_PATH)
    logger.info("Model loaded")

    # Open camera
    logger.info(f"Opening camera {cfg.CAMERA_INDEX}...")
    cap = cv2.VideoCapture(cfg.CAMERA_INDEX)
    if not cap.isOpened():
        logger.error("Failed to open camera. Exiting.")
        sys.exit(1)
    logger.info("Camera ready")

    # Startup info
    logger.info("=" * 60)
    logger.info(f"  PACER Detection Service")
    logger.info(f"  Camera ID:  {cfg.CAMERA_ID}")
    logger.info(f"  Location:   {cfg.LOCATION_LABEL}")
    logger.info(f"  GPS:        {cfg.GPS_LAT}, {cfg.GPS_LNG}")
    logger.info(f"  Backend:    {cfg.BACKEND_URL}")
    logger.info(f"  Interval:   {cfg.DETECTION_INTERVAL}s")
    logger.info(f"  Cooldown:   {cfg.COOLDOWN_SECONDS}s")
    logger.info(f"  Preview:    {cfg.SHOW_PREVIEW}")
    logger.info("=" * 60)

    # Flush any existing offline queue on startup
    queued = queue_size()
    if queued > 0:
        logger.info(f"Flushing {queued} queued events...")
        flush_queue()

    frame_count = 0
    violations_sent = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Failed to read frame, retrying...")
                time.sleep(1)
                continue

            frame_count += 1

            # Run YOLO inference
            results = model(frame, conf=cfg.CONFIDENCE_THRESHOLD, verbose=False)

            # Analyze detections for violations
            violations = analyze_detections(results)

            # Show preview if enabled
            if cfg.SHOW_PREVIEW:
                annotated = results[0].plot()
                # Overlay violation info
                for i, v in enumerate(violations):
                    text = f"{v['violation_type']} ({v['confidence']:.2f})"
                    cv2.putText(annotated, text, (10, 30 + i * 25),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                cv2.imshow("PACER Detection", annotated)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    logger.info("Preview window closed by user")
                    break

            # Process each detected violation
            for violation in violations:
                vtype = violation["violation_type"]

                # Check cooldown
                if _is_on_cooldown(vtype):
                    continue

                logger.info(f"[VIOLATION] {vtype} (conf: {violation['confidence']:.2f})")

                # Save frame to temp file
                tmp_path = os.path.join(
                    tempfile.gettempdir(),
                    f"pacer_{int(time.time())}_{vtype}.jpg",
                )
                cv2.imwrite(tmp_path, frame)

                # Strip internal fields from bounding boxes
                clean_boxes = []
                for box in violation.get("bounding_boxes", []):
                    clean_boxes.append({
                        "x": box["x"], "y": box["y"],
                        "w": box["w"], "h": box["h"],
                        "label": box["label"],
                        "confidence": box["confidence"],
                    })

                # Build event data
                event_data = {
                    "violation_type": vtype,
                    "confidence": violation["confidence"],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "camera_source": cfg.CAMERA_SOURCE,
                    "camera_id": cfg.CAMERA_ID,
                    "gps_lat": cfg.GPS_LAT,
                    "gps_lng": cfg.GPS_LNG,
                    "location_label": cfg.LOCATION_LABEL,
                    "bounding_boxes": clean_boxes,
                }

                # Send to backend
                _send_to_backend(tmp_path, event_data)
                _mark_sent(vtype)
                violations_sent += 1

                # Clean up temp file
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

            # Periodically flush offline queue (every 100 frames)
            if frame_count % 100 == 0:
                queued = queue_size()
                if queued > 0:
                    logger.info(f"Periodic queue flush: {queued} events pending")
                    flush_queue()

            # Throttle detection rate
            time.sleep(cfg.DETECTION_INTERVAL)

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        cap.release()
        if cfg.SHOW_PREVIEW:
            cv2.destroyAllWindows()
        logger.info(f"Session stats: {frame_count} frames, {violations_sent} violations sent")


if __name__ == "__main__":
    run_detection_loop()
