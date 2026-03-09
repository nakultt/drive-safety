"""
ONNX Export Script — Run this on your Mac
==========================================
Exports the YOLO model to ONNX format, which is
architecture-independent and works on Raspberry Pi
without needing PyTorch.

Usage:
    python3 export_onnx.py
"""

from ultralytics import YOLO  # type: ignore

print("Loading YOLOv8 model...")
model = YOLO("yolo26n.pt")

print("Exporting to ONNX format...")
model.export(format="onnx")

print("Done! Copy 'yolo26n.onnx' to your Raspberry Pi.")
