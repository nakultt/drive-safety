from __future__ import annotations

"""
PACER Annotation Service
Draws bounding boxes on violation frames using OpenCV.
"""

import logging
import cv2
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# Color palette for different violation labels (BGR format)
LABEL_COLORS = {
    "helmet_absence": (0, 0, 255),       # Red
    "triple_riding": (0, 165, 255),       # Orange
    "driver_distraction": (0, 255, 255),  # Yellow
    "wrong_side_driving": (255, 0, 0),    # Blue
    "overspeeding": (255, 0, 255),        # Magenta
    "pothole": (0, 255, 0),               # Green
    "animal_crossing": (255, 255, 0),     # Cyan
    "person": (0, 200, 200),              # Dark yellow
    "vehicle": (200, 100, 0),             # Dark blue
}

DEFAULT_COLOR = (255, 255, 255)  # White


def draw_bounding_boxes(
    image_path: str,
    output_path: str,
    bounding_boxes: list[dict],
) -> Optional[str]:
    """
    Draw bounding boxes on the image and save to output_path.
    
    Args:
        image_path: Path to the source image
        output_path: Path to save the annotated image
        bounding_boxes: List of dicts with {x, y, w, h, label, confidence}
    
    Returns:
        output_path on success, None on failure
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            logger.error(f"Failed to read image: {image_path}")
            return None

        for box in bounding_boxes:
            x = int(box.get("x", 0))
            y = int(box.get("y", 0))
            w = int(box.get("w", 0))
            h = int(box.get("h", 0))
            label = box.get("label", "unknown")
            conf = box.get("confidence", 0.0)

            color = LABEL_COLORS.get(label, DEFAULT_COLOR)

            # Draw rectangle
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)

            # Draw label background
            label_text = f"{label} {conf:.2f}"
            (text_w, text_h), baseline = cv2.getTextSize(
                label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
            )
            cv2.rectangle(
                img,
                (x, y - text_h - baseline - 4),
                (x + text_w + 4, y),
                color,
                -1,
            )

            # Draw label text
            cv2.putText(
                img,
                label_text,
                (x + 2, y - baseline - 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                1,
                cv2.LINE_AA,
            )

        cv2.imwrite(output_path, img)
        logger.info(f"Annotated image saved: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Annotation failed: {e}")
        return None


def crop_plate_region(
    image_path: str,
    output_path: str,
    crop_bottom_percent: float = 0.4,
) -> Optional[str]:
    """
    Crop the bottom portion of the image as the plate region.
    
    Args:
        image_path: Path to the source image
        output_path: Path to save the cropped plate region
        crop_bottom_percent: Percentage of the image height to crop from the bottom
    
    Returns:
        output_path on success, None on failure
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            logger.error(f"Failed to read image for plate crop: {image_path}")
            return None

        h, w = img.shape[:2]
        crop_start = int(h * (1 - crop_bottom_percent))
        plate_region = img[crop_start:h, 0:w]

        cv2.imwrite(output_path, plate_region)
        logger.info(f"Plate region saved: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Plate crop failed: {e}")
        return None
