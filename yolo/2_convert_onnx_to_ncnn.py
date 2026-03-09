"""
Step 2: Convert ONNX to NCNN Format (Automated explicitly in Python)
====================================================================
This script downloads the official `onnx2ncnn` executable from Tencent's GitHub
releases for your operating system, extracts it, and automatically converts
the `yolo26n.onnx` file into a `yolo26n_ncnn_model/model.ncnn.param` and `.bin`.

NO PyTorch or Ultralytics needed here!

Usage:
    python 2_convert_onnx_to_ncnn.py
"""

import os
import sys
import urllib.request
import zipfile
import subprocess
import shutil

# Configuration
ONNX_MODEL = "yolo26n.onnx"
OUTPUT_DIR = "yolo26n_ncnn_model"
PARAM_FILE = os.path.join(OUTPUT_DIR, "model.ncnn.param")
BIN_FILE = os.path.join(OUTPUT_DIR, "model.ncnn.bin")
NCNN_VERSION = "20240410"

def get_ncnn_release_url():
    base_url = f"https://github.com/Tencent/ncnn/releases/download/{NCNN_VERSION}/"
    if sys.platform == "win32":
        filename = f"ncnn-{NCNN_VERSION}-windows-vs2022.zip"
    elif sys.platform == "darwin":
        filename = f"ncnn-{NCNN_VERSION}-macos.zip"
    elif sys.platform.startswith("linux"):
        filename = f"ncnn-{NCNN_VERSION}-ubuntu-2204.zip"
    else:
        raise OSError(f"Unsupported platform: {sys.platform}")
    return base_url + filename, filename

def download_and_extract(url, filename):
    print(f"Downloading ncnn tools from {url} ...")
    if not os.path.exists(filename):
        urllib.request.urlretrieve(url, filename)
        print("Download complete.")
    else:
        print("Found cached zip file.")

    extract_dir = "ncnn_tools"
    if not os.path.exists(extract_dir):
        print(f"Extracting {filename} to {extract_dir} ...")
        with zipfile.ZipFile(filename, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
    
    return extract_dir

def find_onnx2ncnn(extract_dir):
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            if file == "onnx2ncnn" or file == "onnx2ncnn.exe":
                return os.path.join(root, file)
    return None

def main():
    if not os.path.exists(ONNX_MODEL):
        print(f"Error: {ONNX_MODEL} not found! Please run Step 1 first.")
        sys.exit(1)

    url, filename = get_ncnn_release_url()
    extract_dir = download_and_extract(url, filename)

    onnx2ncnn_path = find_onnx2ncnn(extract_dir)
    if not onnx2ncnn_path:
        print("Error: Could not find onnx2ncnn executable in the downloaded tools!")
        sys.exit(1)

    print(f"Found onnx2ncnn at: {onnx2ncnn_path}")
    
    # Needs executable permissions on Mac/Linux
    if sys.platform != "win32":
        os.chmod(onnx2ncnn_path, 0o755)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Converting {ONNX_MODEL} to NCNN format...")
    cmd = [onnx2ncnn_path, ONNX_MODEL, PARAM_FILE, BIN_FILE]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"Conversion successful!")
        print(f"Param file: {PARAM_FILE}")
        print(f"Bin file: {BIN_FILE}")
    else:
        print("Conversion failed!")
        print("Error output:\n", result.stderr)

if __name__ == "__main__":
    main()
