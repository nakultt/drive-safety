# YOLO NCNN Deployment Pipeline for Raspberry Pi 4

This document outlines how to take a PyTorch YOLO model, export it to ONNX, convert it to NCNN natively, and run it on a Raspberry Pi 4 **without using PyTorch or Ultralytics** locally.

## Prerequisite: On your Mac / PC

First, export your PyTorch `.pt` model to ONNX. This is the only step that requires PyTorch and Ultralytics.
Run the existing script on your PC:
```bash
python export_onnx.py
```
This produces `yolo26n.onnx`.

## Step 1: Convert ONNX to NCNN (Without PyTorch)

To convert the `.onnx` model to NCNN format (`.param` and `.bin` files) without installing PyTorch or Ultralytics, you will use the `onnx2ncnn` C++ executable provided by the NCNN project.

### Option A: Do it on your Mac / PC (Recommended)
You can download the precompiled NCNN tools for your OS from the [NCNN Releases page](https://github.com/Tencent/ncnn/releases) (e.g., `ncnn-YYYYMMDD-windows-vs2022.zip` or `ncnn-YYYYMMDD-macos.zip`).
Extract it, and run:
```bash
./onnx2ncnn yolo26n.onnx model.ncnn.param model.ncnn.bin
```

### Option B: Do it directly on the Raspberry Pi 4
If you want to do the conversion on the Pi itself:
1. Compile NCNN on your Raspberry Pi:
```bash
sudo apt-get install cmake build-essential libprotobuf-dev protobuf-compiler
git clone https://github.com/Tencent/ncnn.git
cd ncnn
git submodule update --init
mkdir build && cd build
cmake -DNCNN_BUILD_TOOLS=ON -DNCNN_BUILD_EXAMPLES=OFF ..
make -j4
```
2. Convert the model:
```bash
./tools/onnx/onnx2ncnn ../../yolo26n.onnx model.ncnn.param model.ncnn.bin
```

## Step 2: Running Inference on Raspberry Pi 4

Once you have `model.ncnn.param` and `model.ncnn.bin`, transfer these to your Raspberry Pi.

### Install Dependencies
You only need the `ncnn` python package, Numpy, and OpenCV Headless:
```bash
pip install ncnn numpy opencv-python-headless
```

### Run the Standalone Script
Run the `yolo_img_ncnn.py` script provided in this folder:
```bash
python yolo_img_ncnn.py
```
This script reads the `.param` and `.bin` files and runs purely on the NCNN C++ backend through its Python API. It includes custom NMS (Non-Maximum Suppression) and bounding box handling so it doesn't need PyTorch or Ultralytics.
