"""
Step 3: NCNN Inference on Images (No OpenCV)
==============================================
Runs YOLO object detection using natively exported NCNN model and only:
  - ncnn
  - Pillow (PIL)
  - numpy

This is ideal for the Raspberry Pi 4 where installing OpenCV can be heavy.
Install: pip install ncnn numpy Pillow

Usage:
    python 3_ncnn_infer_image.py --image images/bus.jpg
"""

import argparse
import numpy as np
import ncnn
import time
from PIL import Image, ImageDraw, ImageFont
import os
import glob

# ---- Configuration ----
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARAM_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.param")
BIN_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.bin")
CONFIDENCE_THRESHOLD = 0.5
NMS_THRESHOLD = 0.45
INPUT_SIZE = (640, 640)

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

def nms_numpy(boxes, scores, iou_threshold):
    """Pure Numpy Non-Maximum Suppression"""
    if len(boxes) == 0:
        return []
    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        iou = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]
    return keep

def preprocess_pil(image, input_size):
    """Resize and pad image using Pillow."""
    w, h = image.size
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    
    resized_image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
    padded_image = Image.new("RGB", (input_size[1], input_size[0]), (114, 114, 114))
    
    pad_w = (input_size[1] - new_w) // 2
    pad_h = (input_size[0] - new_h) // 2
    padded_image.paste(resized_image, (pad_w, pad_h))
    
    padded_np = np.array(padded_image)
    mat_in = ncnn.Mat.from_pixels(padded_np, ncnn.Mat.PixelType.PIXEL_RGB, padded_np.shape[1], padded_np.shape[0])
    
    mean_vals, norm_vals = [0.0, 0.0, 0.0], [1/255.0, 1/255.0, 1/255.0]
    mat_in.substract_mean_normalize(mean_vals, norm_vals)

    return mat_in, scale, pad_h, pad_w

def postprocess_nocv(mat_out, scale, pad_h, pad_w, conf_threshold, nms_threshold):
    """Parse YOLO output and return detections."""
    output = np.array(mat_out)
    if len(output.shape) == 3: output = output[0]
    if output.shape[0] == 84: output = output.T

    boxes = output[:, :4]
    scores = output[:, 4:]

    class_ids = np.argmax(scores, axis=1)
    confidences = scores[np.arange(len(scores)), class_ids]

    mask = confidences > conf_threshold
    boxes, confidences, class_ids = boxes[mask], confidences[mask], class_ids[mask]

    if len(boxes) == 0: return []

    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1, y1 = cx - w / 2, cy - h / 2
    x2, y2 = cx + w / 2, cy + h / 2
    nms_boxes = np.column_stack((x1, y1, x2, y2))
    
    keep_indices = nms_numpy(nms_boxes, confidences, nms_threshold)
    
    results = []
    for idx in keep_indices:
        x1_b, y1_b, x2_b, y2_b = nms_boxes[idx]
        orig_x1 = (x1_b - pad_w) / scale
        orig_y1 = (y1_b - pad_h) / scale
        orig_x2 = (x2_b - pad_w) / scale
        orig_y2 = (y2_b - pad_h) / scale
        
        results.append({
            "bbox": [int(orig_x1), int(orig_y1), int(orig_x2), int(orig_y2)],
            "confidence": float(confidences[idx]),
            "class_id": int(class_ids[idx]),
            "class_name": CLASS_NAMES[int(class_ids[idx])] if int(class_ids[idx]) < len(CLASS_NAMES) else "unknown"
        })
    return results

def draw_detections_pil(image, detections, time_ms):
    """Draw bounding boxes and labels on PIL image."""
    draw = ImageDraw.Draw(image)
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        label = f"{det['class_name']} {det['confidence']:.2f}"
        
        draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
        draw.text((x1, max(0, y1 - 15)), label, fill="red")
        
    draw.text((10, 10), f"NCNN Latency: {time_ms:.1f}ms", fill="blue")
    return image

def run_inference(image_path, net, out_path):
    print(f"\nProcessing: {image_path}")
    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Error: Could not read image: {e}")
        return

    mat_in, scale, pad_h, pad_w = preprocess_pil(image, INPUT_SIZE)

    start = time.time()
    with net.create_extractor() as ex:
        ex.input("in0", mat_in)
        _, mat_out = ex.extract("out0")
    t_ms = (time.time() - start) * 1000

    detections = postprocess_nocv(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
    
    print(f"  [Time] Inference: {t_ms:.2f} ms")
    print(f"  Detected {len(detections)} objects:")
    for d in detections:
        print(f"    - {d['class_name']} ({d['confidence']:.2f})")
        
    annotated = draw_detections_pil(image, detections, t_ms)
    annotated.save(out_path)
    print(f"  Saved output to: {out_path}")

def main():
    import os
    import glob

    print("Loading NCNN model...")
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False 
    net.load_param(PARAM_PATH)
    net.load_model(BIN_PATH)
    print("Model loaded successfully!")
    
    image_dir = os.path.join(SCRIPT_DIR, "images")
    output_dir = os.path.join(SCRIPT_DIR, "output_ncnn")
    os.makedirs(output_dir, exist_ok=True)
    
    # Process all common image types in the directory
    image_paths = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        image_paths.extend(glob.glob(os.path.join(image_dir, ext)))
        
    if not image_paths:
        print(f"No images found in {image_dir}/")
        return

    print(f"Found {len(image_paths)} images in {image_dir}/. Processing...")
    
    for img_path in image_paths:
        filename = os.path.basename(img_path)
        out_path = os.path.join(output_dir, f"ncnn_{filename}")
        run_inference(img_path, net, out_path)

if __name__ == "__main__":
    main()
