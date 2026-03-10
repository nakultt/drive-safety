"""
Pothole Detection using fine-tuned YOLO model with OpenCV.

Usage:
  Image:   python detect_pothole.py --source path/to/image.jpg
  Video:   python detect_pothole.py --source path/to/video.mp4
  Webcam:  python detect_pothole.py --source 0
"""

import argparse
import cv2
import numpy as np
from ultralytics import YOLO

# --- Configuration ---
MODEL_PATH = r"C:\Users\ADMIN\OneDrive\Documents\drive-safety\runs\detect\pothole_training\yolo26n_pothole3\weights\best.pt"
CONFIDENCE_THRESHOLD = 0.5
BOX_COLOR = (0, 0, 255)       # Red in BGR
TEXT_COLOR = (255, 255, 255)   # White
BOX_THICKNESS = 2
FONT_SCALE = 0.7


def detect_image(model, image_path):
    """Run detection on a single image and display the result."""
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"Error: Could not read image '{image_path}'")
        return

    annotated = run_detection(model, frame)

    cv2.imshow("Pothole Detection", annotated)
    print("Press any key to close...")
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Save output
    output_path = "output_pothole_detection.jpg"
    cv2.imwrite(output_path, annotated)
    print(f"Saved result to {output_path}")


def detect_video(model, source):
    """Run detection on video or webcam feed."""
    # If source is a digit string, treat as webcam index
    if str(source).isdigit():
        source = int(source)

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"Error: Could not open video source '{source}'")
        return

    print("Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        annotated = run_detection(model, frame)

        cv2.imshow("Pothole Detection", annotated)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


def run_detection(model, frame):
    """Run YOLO detection on a single frame and draw bounding boxes using OpenCV."""
    results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        for box in boxes:
            # Get bounding box coordinates (xyxy format)
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]

            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), BOX_COLOR, BOX_THICKNESS)

            # Draw label background
            label = f"{class_name} {confidence:.2f}"
            (label_w, label_h), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, FONT_SCALE, 1
            )
            cv2.rectangle(
                frame,
                (x1, y1 - label_h - 10),
                (x1 + label_w + 5, y1),
                BOX_COLOR,
                -1,
            )

            # Draw label text
            cv2.putText(
                frame,
                label,
                (x1 + 2, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                FONT_SCALE,
                TEXT_COLOR,
                1,
                cv2.LINE_AA,
            )

    return frame


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pothole Detection with YOLO + OpenCV")
    parser.add_argument(
        "--source",
        type=str,
        default="0",
        help="Path to image/video file, or '0' for webcam (default: 0)",
    )
    args = parser.parse_args()

    print(f"Loading model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)

    source = args.source

    # Determine if source is an image, video, or webcam
    if source.isdigit():
        print(f"Starting webcam (index {source})...")
        detect_video(model, source)
    elif source.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".tiff")):
        print(f"Detecting on image: {source}")
        detect_image(model, source)
    else:
        print(f"Detecting on video: {source}")
        detect_video(model, source)
