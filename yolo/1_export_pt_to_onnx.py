"""
Step 1: Export YOLOv8/YOLOv11 PyTorch model to ONNX
====================================================
This script requires `ultralytics` and `torch` to be installed.
It should be run on your development machine (PC/Mac), NOT on the Raspberry Pi.

Usage:
    python 1_export_pt_to_onnx.py
"""

from ultralytics import YOLO # type: ignore

def main():
    model_path = "yolo26n.pt"
    print(f"Loading YOLO model from {model_path}...")
    model = YOLO(model_path)
    
    print("Exporting model to ONNX format...")
    # opset 11 or 12 is generally best for ncnn, ultralytics default is usually fine
    export_path = model.export(format="onnx")
    
    print(f"Export successful! ONNX model saved at: {export_path}")
    print("\nNext Step:")
    print("Use the 'onnx2ncnn' tool to convert the ONNX model to NCNN format (.param and .bin files).")
    print("Example: ./onnx2ncnn yolo26n.onnx model.ncnn.param model.ncnn.bin")

if __name__ == "__main__":
    main()
