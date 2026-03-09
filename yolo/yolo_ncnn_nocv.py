"""
YOLO NCNN Inference — Standalone (NO PyTorch, NO opencv)
==============================================================
Runs YOLO object detection using natively exported NCNN model and only:
  - ncnn
  - Pillow (PIL)
  - numpy

Install on Raspberry Pi 4:
    pip install ncnn numpy Pillow

Usage:
    python yolo_ncnn_nocv.py
"""

import numpy as np
import ncnn
import time
from PIL import Image

# ---- Configuration ----
PARAM_PATH = "./yolo26n_ncnn_model/model.ncnn.param"
BIN_PATH = "./yolo26n_ncnn_model/model.ncnn.bin"
CONFIDENCE_THRESHOLD = 0.5
NMS_THRESHOLD = 0.45
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

def nms_numpy(boxes, scores, iou_threshold):
    """Pure Numpy Non-Maximum Suppression"""
    if len(boxes) == 0:
        return []
        
    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]
    
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
    
    # Letterbox resize
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    
    # PIL resizes as (width, height)
    resized_image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create padded image (color format is RGB, pad with gray 114)
    padded_image = Image.new("RGB", (input_size[1], input_size[0]), (114, 114, 114))
    
    pad_w = (input_size[1] - new_w) // 2
    pad_h = (input_size[0] - new_h) // 2
    
    padded_image.paste(resized_image, (pad_w, pad_h))
    
    # Convert back to numpy for NCNN
    padded_np = np.array(padded_image)
    
    # Convert to NCNN Mat
    # from_pixels scales naturally to NCNN format, we pass RGB format.
    mat_in = ncnn.Mat.from_pixels(padded_np, ncnn.Mat.PixelType.PIXEL_RGB, padded_np.shape[1], padded_np.shape[0])
    
    # YOLO normalizes by dividing by 255.0. No mean subtraction.
    mean_vals = [0.0, 0.0, 0.0]
    norm_vals = [1/255.0, 1/255.0, 1/255.0]
    mat_in.substract_mean_normalize(mean_vals, norm_vals)

    return mat_in, scale, pad_h, pad_w


def postprocess_nocv(mat_out, scale, pad_h, pad_w, conf_threshold, nms_threshold):
    """Parse YOLO output and return detections."""
    # Convert NCNN Mat to numpy array
    output = np.array(mat_out)
    
    # Handle different shape variants (1, 84, 8400) or (84, 8400)
    if len(output.shape) == 3:
        output = output[0]  # (84, 8400)
    
    # Transpose so it is (8400, 84)
    if output.shape[0] == 84:
        output = output.T

    boxes = output[:, :4]
    scores = output[:, 4:]

    # Get max class score for each box
    class_ids = np.argmax(scores, axis=1)
    confidences = scores[np.arange(len(scores)), class_ids]

    # Filter out low confidence boxes
    mask = confidences > conf_threshold
    boxes = boxes[mask]
    confidences = confidences[mask]
    class_ids = class_ids[mask]

    results = []
    if len(boxes) == 0:
        return results

    # Convert cx, cy, w, h to x1, y1, x2, y2 for NMS
    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1 = cx - w / 2
    y1 = cy - h / 2
    x2 = cx + w / 2
    y2 = cy + h / 2
    
    nms_boxes = np.column_stack((x1, y1, x2, y2))
    
    # Run Numpy NMS
    keep_indices = nms_numpy(nms_boxes, confidences, nms_threshold)
    
    for idx in keep_indices:
        x1_b, y1_b, x2_b, y2_b = nms_boxes[idx]
        conf = confidences[idx]
        cls_id = class_ids[idx]
        
        # Remove padding & rescale
        orig_x1 = (x1_b - pad_w) / scale
        orig_y1 = (y1_b - pad_h) / scale
        orig_x2 = (x2_b - pad_w) / scale
        orig_y2 = (y2_b - pad_h) / scale
        
        results.append({
            "bbox": [int(orig_x1), int(orig_y1), int(orig_x2), int(orig_y2)],
            "confidence": float(conf),
            "class_id": int(cls_id),
            "class_name": CLASS_NAMES[int(cls_id)] if int(cls_id) < len(CLASS_NAMES) else "unknown"
        })

    return results


def run_inference(image_path, net):
    """Run YOLO inference via NCNN on a single image (No CV)."""
    try:
        # Load image with PIL in RGB mode
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Error: Could not read image '{image_path}': {e}")
        return []

    # Preprocess
    mat_in, scale, pad_h, pad_w = preprocess_pil(image, INPUT_SIZE)

    # Inference loop to time
    start = time.time()
    with net.create_extractor() as ex:
        ex.input("in0", mat_in)
        _, mat_out = ex.extract("out0")
    t_ms = (time.time() - start) * 1000
    print(f"  [Time] NCNN Inference: {t_ms:.2f} ms")

    # Postprocess
    detections = postprocess_nocv(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)

    return detections


if __name__ == "__main__":
    print("Loading NCNN model...")
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False 
    net.load_param(PARAM_PATH)
    net.load_model(BIN_PATH)
    print("Model loaded successfully!")

    images = [
        "./images/tripleriding.jpeg",
        "./images/elephant.jpeg",
    ]

    for img_path in images:
        print(f"\nProcessing: {img_path}")
        detections = run_inference(img_path, net)

        print(f"  Detected {len(detections)} objects:")
        for d in detections:
            bbox = d["bbox"]
            print(f"    - {d['class_name']} ({d['confidence']:.2f}) at [x1={bbox[0]}, y1={bbox[1]}, x2={bbox[2]}, y2={bbox[3]}]")

    print("\nDone!")
