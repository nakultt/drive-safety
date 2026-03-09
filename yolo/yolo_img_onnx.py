"""
YOLO ONNX Inference — Standalone (NO PyTorch, NO ultralytics)
==============================================================
Runs YOLO object detection using only:
  - onnxruntime
  - opencv-python-headless
  - numpy

Install on Raspberry Pi:
    pip install onnxruntime opencv-python-headless numpy

Usage:
    python3 yolo_img_onnx.py
"""

import cv2
import numpy as np
import onnxruntime as ort


# ---- Configuration ----
MODEL_PATH = "./yolo26n.onnx"
CONFIDENCE_THRESHOLD = 0.5
INPUT_SIZE = (640, 640)

# COCO class names (80 classes)
CLASS_NAMES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck",
    "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra",
    "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
    "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove",
    "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
    "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
    "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
    "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink",
    "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
    "hair drier", "toothbrush"
]

# Random colors for each class
np.random.seed(42)
COLORS = np.random.randint(0, 255, size=(len(CLASS_NAMES), 3), dtype=np.uint8)


def preprocess(image, input_size):
    """Resize and normalize image for YOLO input."""
    h, w = image.shape[:2]
    # Letterbox resize (maintain aspect ratio)
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (new_w, new_h))

    # Pad to input_size
    padded = np.full((input_size[0], input_size[1], 3), 114, dtype=np.uint8)
    pad_h = (input_size[0] - new_h) // 2
    pad_w = (input_size[1] - new_w) // 2
    padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized

    # Convert to float, normalize, transpose to NCHW
    blob = padded.astype(np.float32) / 255.0
    blob = blob.transpose(2, 0, 1)  # HWC -> CHW
    blob = np.expand_dims(blob, axis=0)  # Add batch dim

    return blob, scale, pad_h, pad_w


def postprocess(output, scale, pad_h, pad_w, conf_threshold):
    """Parse YOLO output and return detections."""
    detections = output[0]  # Shape: (1, num_detections, 6) for end2end models

    # Handle different output shapes
    if len(detections.shape) == 3:
        detections = detections[0]  # Remove batch dim -> (num_detections, 6)

    results = []
    for det in detections:
        # end2end model output: [x1, y1, x2, y2, confidence, class_id]
        if len(det) == 6:
            x1, y1, x2, y2, conf, cls_id = det
        else:
            continue

        if conf < conf_threshold:
            continue

        # Remove padding and rescale to original image
        x1 = (x1 - pad_w) / scale
        y1 = (y1 - pad_h) / scale
        x2 = (x2 - pad_w) / scale
        y2 = (y2 - pad_h) / scale

        results.append({
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "confidence": float(conf),
            "class_id": int(cls_id),
            "class_name": CLASS_NAMES[int(cls_id)] if int(cls_id) < len(CLASS_NAMES) else "unknown"
        })

    return results


def draw_detections(image, detections):
    """Draw bounding boxes and labels on image."""
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        color = tuple(int(c) for c in COLORS[det["class_id"] % len(COLORS)])
        label = f"{det['class_name']} {det['confidence']:.2f}"

        # Draw box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Draw label background
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - th - 8), (x1 + tw, y1), color, -1)
        cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    return image


def run_inference(image_path, session):
    """Run YOLO inference on a single image."""
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not read image '{image_path}'")
        return None, []

    # Preprocess
    blob, scale, pad_h, pad_w = preprocess(image, INPUT_SIZE)

    # Run model
    input_name = session.get_inputs()[0].name
    output = session.run(None, {input_name: blob})

    # Postprocess
    detections = postprocess(output, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD)

    # Draw results
    annotated = draw_detections(image.copy(), detections)

    return annotated, detections


if __name__ == "__main__":
    # Load ONNX model
    print("Loading ONNX model...")
    session = ort.InferenceSession(MODEL_PATH)
    print("Model loaded!")

    # Process images
    images = [
        ("./images/tripleriding.jpeg", "output_tripleriding.jpg"),
        ("./images/elephant.jpeg", "output_elephant.jpg"),
    ]

    for img_path, out_path in images:
        print(f"\nProcessing: {img_path}")
        annotated, detections = run_inference(img_path, session)

        if annotated is not None:
            cv2.imwrite(out_path, annotated)
            print(f"  Detected {len(detections)} objects:")
            for d in detections:
                print(f"    - {d['class_name']} ({d['confidence']:.2f})")
            print(f"  Saved to: {out_path}")

    print("\nDone!")
