"""
NCNN Conversion Script for Raspberry Pi
========================================
Run this script ON THE RASPBERRY PI to convert the YOLOv8 model
to NCNN format optimized for the Pi's ARM architecture.

Prerequisites:
    pip install ultralytics

Usage:
    python3 convert_ncnn_pi.py
"""

from ultralytics import YOLO  # type: ignore

# Step 1: Load the PyTorch model
print("Loading YOLOv8 model...")
model = YOLO("yolo26n.pt")

# Step 2: Export to NCNN format (compiled for this device's CPU)
print("Exporting to NCNN format (this may take a few minutes on Pi)...")
model.export(format="ncnn")
print("Export complete! Model saved to: yolo26n_ncnn_model/")

# Step 3: Verify the exported model works
print("Verifying NCNN model...")
ncnn_model = YOLO("yolo26n_ncnn_model")
results = ncnn_model("./images/tripleriding.jpeg")
print(f"Verification passed! Detected {len(results[0].boxes)} objects.")
print("You can now use 'yolo26n_ncnn_model' in your other scripts.")
