#!/usr/bin/env python3
"""
PACER — Manual Number Plate Extraction Script
===============================================
Set the IMAGE_PATH variable below, run the script, and it will:
1. Send the image to Gemini Vision for number plate OCR
2. Find the latest violation in MongoDB
3. Update that violation record with the extracted plate data

Usage:
    conda activate torch
    python extract_plates.py
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone

import pymongo
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

# ─── ⬇️ SET YOUR IMAGE PATH HERE ⬇️ ────────────────────────────────────────────
IMAGE_PATH = r"E:\Github\drive-safety\backend\test_number_plate_img\np.jpeg"
# ─── ⬆️ SET YOUR IMAGE PATH HERE ⬆️ ────────────────────────────────────────────

# ─── Setup ───────────────────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("plate-extractor")

# ─── Config ──────────────────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "pacer_db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY not set in .env — cannot proceed")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ─── MongoDB ─────────────────────────────────────────────────────────────────────
client = pymongo.MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
violations_col = db["violations"]
vehicles_col = db["vehicles"]

RISK_WEIGHTS = {
    "helmet_absence": 1, "triple_riding": 2, "driver_distraction": 2,
    "wrong_side_driving": 3, "overspeeding": 2, "pothole": 0, "animal_crossing": 0,
}


def compute_risk(score: float) -> str:
    if score >= 8: return "high"
    elif score >= 4: return "medium"
    return "low"


# ─── Main ───────────────────────────────────────────────────────────────────────
def main():
    # 1. Validate the image path
    if not os.path.exists(IMAGE_PATH):
        logger.error(f"Image not found: {IMAGE_PATH}")
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("  PACER Number Plate Extractor")
    logger.info(f"  Image: {IMAGE_PATH}")
    logger.info("=" * 60)

    # 2. Find the latest violation in MongoDB
    violation = violations_col.find_one(
        {"deleted": {"$ne": True}},
        sort=[("created_at", pymongo.DESCENDING)],
    )
    if not violation:
        logger.error("No violations found in MongoDB")
        sys.exit(1)

    vid = violation["violation_id"]
    vtype = violation.get("violation_type", "unknown")
    logger.info(f"Latest violation: {vid} ({vtype})")

    # 3. Send image to Gemini Vision
    logger.info("Sending image to Gemini Vision...")
    try:
        img = Image.open(IMAGE_PATH)
        prompt = """
        Examine this traffic camera image carefully.
        Look for any vehicle number plates visible in the image.
        If you find a number plate, extract the alphanumeric text exactly as it appears.
        Indian number plates follow the format: two letters, two digits, one or two letters, four digits (e.g. TN09AB1234).
        Respond ONLY with a JSON object in this exact format, no markdown, no explanation:
        {"plate_found": true, "plate_number": "TN09AB1234", "confidence": 0.92}
        If no plate is visible or readable, respond:
        {"plate_found": false, "plate_number": null, "confidence": 0.0}
        """
        response = model.generate_content([prompt, img])
        result_text = response.text.strip()

        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1])

        result = json.loads(result_text)
        logger.info(f"Gemini response: {result}")

    except Exception as e:
        logger.error(f"Gemini extraction failed: {e}")
        sys.exit(1)

    plate_number = result.get("plate_number")
    plate_confidence = result.get("confidence", 0.0)
    plate_image_url = None

    # 4. Crop plate region if found
    if result.get("plate_found") and plate_number:
        logger.info(f"✅ Plate found: {plate_number} (confidence: {plate_confidence})")

        try:
            import cv2
            plates_dir = os.path.join(UPLOAD_DIR, "plates")
            os.makedirs(plates_dir, exist_ok=True)
            plate_filename = f"{vid}_plate.jpg"
            plate_path = os.path.join(plates_dir, plate_filename)

            img_cv = cv2.imread(IMAGE_PATH)
            if img_cv is not None:
                h, w = img_cv.shape[:2]
                plate_region = img_cv[int(h * 0.6):h, 0:w]
                cv2.imwrite(plate_path, plate_region)
                plate_image_url = f"/uploads/plates/{plate_filename}"
                logger.info(f"Plate region saved: {plate_path}")
        except Exception as e:
            logger.warning(f"Could not crop plate region: {e}")
    else:
        plate_number = None
        plate_confidence = None
        logger.info("❌ No plate detected in image")

    # 5. Update the violation in MongoDB
    violations_col.update_one(
        {"violation_id": vid},
        {"$set": {
            "number_plate": plate_number,
            "plate_confidence": plate_confidence,
            "plate_image_path": plate_image_url,
        }},
    )
    logger.info(f"Updated violation {vid} in MongoDB")

    # 6. Upsert vehicle record if plate found
    if plate_number:
        now = datetime.now(timezone.utc)
        weight = RISK_WEIGHTS.get(vtype, 0)
        vehicle = vehicles_col.find_one({"number_plate": plate_number})

        if vehicle:
            new_score = vehicle.get("risk_score", 0) + weight
            vtypes = list(set(vehicle.get("violation_types", []) + [vtype]))
            vids = vehicle.get("violation_ids", []) + [vid]
            vehicles_col.update_one(
                {"number_plate": plate_number},
                {"$set": {
                    "last_seen": now,
                    "total_violations": vehicle.get("total_violations", 0) + 1,
                    "violation_types": vtypes,
                    "violation_ids": vids,
                    "risk_score": new_score,
                    "risk_level": compute_risk(new_score),
                }},
            )
        else:
            vehicles_col.insert_one({
                "number_plate": plate_number,
                "first_seen": now, "last_seen": now,
                "total_violations": 1,
                "violation_types": [vtype],
                "violation_ids": [vid],
                "risk_score": weight,
                "risk_level": compute_risk(weight),
            })
        logger.info(f"Vehicle record upserted for: {plate_number}")

    logger.info("=" * 60)
    logger.info("  Done!")
    logger.info(f"  Violation: {vid}")
    logger.info(f"  Plate:     {plate_number or 'Not detected'}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
