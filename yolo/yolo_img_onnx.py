"""
YOLO ONNX Inference — Run this on Raspberry Pi
================================================
Uses ONNX Runtime instead of PyTorch, which has
native ARM/aarch64 support and avoids the
'Illegal instruction' error.

Prerequisites (install on Pi):
    pip install onnxruntime ultralytics opencv-python-headless

Usage:
    python3 yolo_img_onnx.py
"""

from ultralytics import YOLO  # type: ignore
import cv2

# Load ONNX model (no PyTorch needed!)
model = YOLO("./yolo26n.onnx")

frame = "./images/tripleriding.jpeg"
results = model(frame, verbose=True)

frame1 = "./images/elephant.jpeg"
results1 = model(frame1, verbose=True)

annotated_frame = results[0].plot()
annotated_frame1 = results1[0].plot()

# Save output images (works headless — no monitor needed)
cv2.imwrite("output_tripleriding.jpg", annotated_frame)
cv2.imwrite("output_elephant.jpg", annotated_frame1)
print("Results saved to output_tripleriding.jpg and output_elephant.jpg")

# Uncomment below if you have a display connected:
# cv2.imshow("YOLO ONNX Detection 1", annotated_frame)
# cv2.imshow("YOLO ONNX Detection 2", annotated_frame1)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
