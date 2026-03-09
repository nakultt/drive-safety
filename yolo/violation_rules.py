"""
PACER Pi Detection Service — Violation Rules Engine
Maps raw YOLO COCO detections to PACER violation types using heuristic rules.

YOLO26n detects standard COCO classes. Violations are inferred by spatial
relationships between detected objects:

┌─────────────────────────────────────────────────────────────────────────┐
│ Violation Type       │ Detection Rule                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ triple_riding        │ motorcycle + 3 or more persons nearby           │
│ helmet_absence       │ motorcycle + person with head above bike bbox   │
│                      │ (no helmet class, so proxy: rider detected)     │
│ driver_distraction   │ person on motorcycle + cell phone detected      │
│ animal_crossing      │ any animal class detected (dog/cat/horse/cow/   │
│                      │ elephant/bear/zebra/giraffe/sheep/bird)         │
│ pothole              │ (not detectable by COCO — needs custom model    │
│                      │  or separate input; skip in YOLO pipeline)      │
│ wrong_side_driving   │ (needs lane context — not from single frame)    │
│ overspeeding         │ (needs speed measurement — not from YOLO)       │
└─────────────────────────────────────────────────────────────────────────┘

Note: helmet_absence is a "best guess" heuristic since COCO doesn't have a
helmet class. For production accuracy, train a custom YOLO model with
helmet/no-helmet classes.
"""

from __future__ import annotations
from typing import Optional


# COCO class IDs
PERSON = 0
BICYCLE = 1
CAR = 2
MOTORCYCLE = 3
BUS = 5
TRUCK = 7
CELL_PHONE = 67

ANIMAL_CLASSES = {
    14: "bird", 15: "cat", 16: "dog", 17: "horse",
    18: "sheep", 19: "cow", 20: "elephant", 21: "bear",
    22: "zebra", 23: "giraffe",
}


def _boxes_overlap_horizontally(box_a: dict, box_b: dict, threshold: float = 0.3) -> bool:
    """Check if two bounding boxes overlap horizontally (IoU on x-axis)."""
    ax1, ax2 = box_a["x"], box_a["x"] + box_a["w"]
    bx1, bx2 = box_b["x"], box_b["x"] + box_b["w"]
    overlap = max(0, min(ax2, bx2) - max(ax1, bx1))
    min_width = min(box_a["w"], box_b["w"])
    if min_width == 0:
        return False
    return (overlap / min_width) >= threshold


def _is_person_on_motorcycle(person_box: dict, moto_box: dict) -> bool:
    """Check if a person bounding box is positioned 'on' a motorcycle."""
    # Person's bottom should be near or above motorcycle's bottom
    person_bottom = person_box["y"] + person_box["h"]
    moto_bottom = moto_box["y"] + moto_box["h"]
    moto_top = moto_box["y"]

    # Person should overlap horizontally with motorcycle
    if not _boxes_overlap_horizontally(person_box, moto_box, threshold=0.2):
        return False

    # Person's bottom should be within motorcycle's vertical range (roughly)
    # Allow some tolerance (person extends above motorcycle)
    return person_bottom >= moto_top and person_bottom <= moto_bottom + moto_box["h"] * 0.3


def _box_to_dict(box, cls_id: int, cls_name: str, conf: float) -> dict:
    """Convert a YOLO box to our standard dict format."""
    x1, y1, x2, y2 = box
    return {
        "x": float(x1),
        "y": float(y1),
        "w": float(x2 - x1),
        "h": float(y2 - y1),
        "label": cls_name,
        "confidence": round(float(conf), 3),
        "class_id": int(cls_id),
    }


def analyze_detections(results) -> list[dict]:
    """
    Analyze YOLO detection results and return a list of violation events.
    
    Args:
        results: YOLO inference results (from model(frame))
    
    Returns:
        List of violation dicts, each with:
        - violation_type: str
        - confidence: float
        - bounding_boxes: list of {x,y,w,h,label,confidence}
    """
    if not results or len(results) == 0:
        return []

    result = results[0]
    boxes = result.boxes
    if boxes is None or len(boxes) == 0:
        return []

    # Parse all detections into categorized lists
    persons = []
    motorcycles = []
    cell_phones = []
    animals = []
    all_boxes = []

    for i in range(len(boxes)):
        cls_id = int(boxes.cls[i])
        conf = float(boxes.conf[i])
        xyxy = boxes.xyxy[i].tolist()
        cls_name = result.names.get(cls_id, f"class_{cls_id}")

        box_dict = _box_to_dict(xyxy, cls_id, cls_name, conf)
        all_boxes.append(box_dict)

        if cls_id == PERSON:
            persons.append(box_dict)
        elif cls_id == MOTORCYCLE:
            motorcycles.append(box_dict)
        elif cls_id == CELL_PHONE:
            cell_phones.append(box_dict)
        elif cls_id in ANIMAL_CLASSES:
            animals.append(box_dict)

    violations = []

    # ─── Rule 1: Triple Riding ───────────────────────────────────────────────
    for moto in motorcycles:
        riders = [p for p in persons if _is_person_on_motorcycle(p, moto)]
        if len(riders) >= 3:
            avg_conf = sum(r["confidence"] for r in riders) / len(riders)
            combined_conf = min(avg_conf, moto["confidence"])
            violations.append({
                "violation_type": "triple_riding",
                "confidence": round(combined_conf, 3),
                "bounding_boxes": [moto] + riders,
            })

    # ─── Rule 2: Helmet Absence (proxy heuristic) ────────────────────────────
    # Since COCO doesn't detect helmets, we flag all motorcycle riders.
    # In production, use a custom-trained model for helmet detection.
    for moto in motorcycles:
        riders = [p for p in persons if _is_person_on_motorcycle(p, moto)]
        if len(riders) >= 1 and len(riders) < 3:  # Not already triple riding
            combined_conf = min(riders[0]["confidence"], moto["confidence"])
            violations.append({
                "violation_type": "helmet_absence",
                "confidence": round(combined_conf * 0.7, 3),  # Lower confidence (heuristic)
                "bounding_boxes": [moto] + riders,
            })

    # ─── Rule 3: Driver Distraction (cell phone on motorcycle) ───────────────
    for moto in motorcycles:
        riders = [p for p in persons if _is_person_on_motorcycle(p, moto)]
        if riders and cell_phones:
            for phone in cell_phones:
                # Check if phone is near any rider
                for rider in riders:
                    if _boxes_overlap_horizontally(phone, rider, threshold=0.1):
                        combined_conf = min(phone["confidence"], rider["confidence"])
                        violations.append({
                            "violation_type": "driver_distraction",
                            "confidence": round(combined_conf, 3),
                            "bounding_boxes": [moto, rider, phone],
                        })
                        break
                else:
                    continue
                break

    # ─── Rule 4: Animal Crossing ─────────────────────────────────────────────
    if animals:
        best_animal = max(animals, key=lambda a: a["confidence"])
        violations.append({
            "violation_type": "animal_crossing",
            "confidence": round(best_animal["confidence"], 3),
            "bounding_boxes": animals,
        })

    return violations
