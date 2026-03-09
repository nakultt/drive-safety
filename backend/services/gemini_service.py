"""
PACER Gemini AI Service
Handles all Gemini API interactions: number plate OCR, violation summaries, daily digests.
Uses gemini-1.5-flash model for all operations.
"""

import json
import logging
from typing import Optional

import google.generativeai as genai
from PIL import Image

from config import settings

logger = logging.getLogger(__name__)

# Configure Gemini on module load
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None
    logger.warning("GEMINI_API_KEY not set — AI features are disabled")


def extract_number_plate(image_path: str) -> dict:
    """
    Send violation image to Gemini Vision for number plate OCR.
    Returns dict with plate_found, plate_number, confidence.
    """
    if not model:
        logger.warning("Gemini model not available, skipping plate extraction")
        return {"plate_found": False, "plate_number": None, "confidence": 0.0}

    try:
        img = Image.open(image_path)
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

        # Clean up markdown code block if present
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1])

        result = json.loads(result_text)
        logger.info(f"Plate extraction result: {result}")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini plate OCR response: {e}")
        return {"plate_found": False, "plate_number": None, "confidence": 0.0}
    except Exception as e:
        logger.error(f"Gemini plate extraction failed: {e}")
        return {"plate_found": False, "plate_number": None, "confidence": 0.0}


def generate_violation_summary(violation_data: dict) -> Optional[str]:
    """
    Generate a concise enforcement summary for a violation using Gemini.
    Returns summary text or None on failure.
    """
    if not model:
        logger.warning("Gemini model not available, skipping summary generation")
        return None

    try:
        location = violation_data.get("location_label") or (
            f"GPS: {violation_data.get('gps_lat', 'N/A')}, {violation_data.get('gps_lng', 'N/A')}"
        )

        prompt = f"""
        You are a traffic enforcement assistant. Write a concise 2-3 sentence enforcement summary
        in formal language suitable for an official traffic violation record.
        
        Violation details:
        - Type: {violation_data.get('violation_type', 'Unknown')}
        - Vehicle plate: {violation_data.get('number_plate') or 'Not identified'}
        - Location: {location}
        - Time: {violation_data.get('timestamp', 'Unknown')}
        - Camera source: {violation_data.get('camera_source', 'Unknown')}
        - Detection confidence: {violation_data.get('confidence', 'N/A')}
        
        Write only the summary text, no headings or bullet points.
        """
        response = model.generate_content(prompt)
        summary = response.text.strip()
        logger.info(f"Generated violation summary ({len(summary)} chars)")
        return summary

    except Exception as e:
        logger.error(f"Gemini summary generation failed: {e}")
        return None


def generate_daily_digest(stats: dict) -> Optional[str]:
    """
    Generate a 150-word daily enforcement briefing using Gemini.
    Returns briefing text or None on failure.
    """
    if not model:
        logger.warning("Gemini model not available, skipping daily digest")
        return None

    try:
        prompt = f"""
        You are a senior traffic enforcement analyst. Write a 150-word daily enforcement briefing
        for a senior traffic officer based on today's violation statistics.
        Use formal, professional language. Include key highlights, concerning trends, and recommendations.
        
        Today's statistics:
        {json.dumps(stats, indent=2, default=str)}
        
        Write only the briefing text in paragraph form.
        """
        response = model.generate_content(prompt)
        digest = response.text.strip()
        logger.info(f"Generated daily digest ({len(digest)} chars)")
        return digest

    except Exception as e:
        logger.error(f"Gemini daily digest generation failed: {e}")
        return None
