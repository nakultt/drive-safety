"""
YOLO NCNN Inference — Standalone (NO PyTorch, NO ultralytics)
==============================================================
Runs YOLO object detection using natively exported NCNN model and only:
  - ncnn
  - opencv-python-headless
  - numpy

Install on Raspberry Pi 4:
    pip install ncnn opencv-python-headless numpy

Usage:
    python yolo_img_ncnn.py
"""

import os
import cv2
import numpy as np
import ncnn
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- Configuration ----
PARAM_PATH = "./yolo26n_ncnn_model/model.ncnn.param"
BIN_PATH = "./yolo26n_ncnn_model/model.ncnn.bin"
CONFIDENCE_THRESHOLD = 0.25
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

np.random.seed(42)
COLORS = np.random.randint(0, 255, size=(len(CLASS_NAMES), 3), dtype=np.uint8)


def preprocess(image, input_size):
    """Resize and pad image using OpenCV."""
    h, w = image.shape[:2]
    # Letterbox resize
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (new_w, new_h))

    # Pad to input_size
    padded = np.full((input_size[0], input_size[1], 3), 114, dtype=np.uint8)
    pad_h = (input_size[0] - new_h) // 2
    pad_w = (input_size[1] - new_w) // 2
    padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized

    # Convert to NCNN Mat
    # from_pixels scales naturally to NCNN format, we pass BGR format.
    # YOLO typically expects RGB order.
    # We do letterbox ourselves above, so from_pixels doesn't need to resize again.
    mat_in = ncnn.Mat.from_pixels(padded, ncnn.Mat.PixelType.PIXEL_BGR2RGB, padded.shape[1], padded.shape[0])
    
    # YOLO normalizes by dividing by 255.0. No mean subtraction.
    mean_vals = [0.0, 0.0, 0.0]
    norm_vals = [1/255.0, 1/255.0, 1/255.0]
    mat_in.substract_mean_normalize(mean_vals, norm_vals)

    return mat_in, scale, pad_h, pad_w


def postprocess(mat_out, scale, pad_h, pad_w, conf_threshold, nms_threshold):
    """Parse YOLO output and return detections."""
    # Convert NCNN Mat to numpy array
    output = np.array(mat_out)
    
    # YOLO end2end model output: [x1, y1, x2, y2, class_id, confidence]
    if len(output.shape) == 2 and output.shape[1] == 6:
        # This block handles a different output format (e.g., end-to-end detection)
        # The original code expects a (N, 84) or (84, N) format.
        # This heuristic attempts to determine if class_id and confidence are swapped.
        # It also filters by confidence.
        
        # Create lists to store filtered results
        filtered_boxes = []
        filtered_confidences = []
        filtered_class_ids = []

        for det in output:
            # Heuristic: if 5th element is small (<1.0) and 6th is large (>1.0),
            # assume 5th is confidence and 6th is class_id.
            # Otherwise, assume 5th is class_id and 6th is confidence.
            if det[4] < 1.0 and det[5] > 1.0: 
                x1, y1, x2, y2, conf, cls_id = det
            else: 
                x1, y1, x2, y2, cls_id, conf = det
            
            if conf < conf_threshold:
                continue # Skip low confidence detections
            
            filtered_boxes.append([x1, y1, x2, y2])
            filtered_confidences.append(conf)
            filtered_class_ids.append(int(cls_id)) # Ensure class_id is integer

        # Convert filtered lists back to numpy arrays for NMS
        boxes = np.array(filtered_boxes)
        confidences = np.array(filtered_confidences)
        class_ids = np.array(filtered_class_ids)

        # If no detections after filtering, return empty list
        if len(boxes) == 0:
            return []

        # Convert x1, y1, x2, y2 to x, y, w, h for OpenCV NMS
        x = boxes[:, 0]
        y = boxes[:, 1]
        w = boxes[:, 2] - boxes[:, 0]
        h = boxes[:, 3] - boxes[:, 1]
        nms_boxes = np.column_stack((x, y, w, h)).tolist()

        # Run OpenCV NMS
        indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), conf_threshold, nms_threshold)
        
        results = []
        if len(indices) > 0:
            for i in indices:
                idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
                x1, y1, x2, y2 = filtered_boxes[idx] # Use original x1,y1,x2,y2
                conf = confidences[idx]
                cls_id = class_ids[idx]
                
                # Remove padding & rescale (assuming x1,y1,x2,y2 are already in input_size scale)
                orig_x1 = (x1 - pad_w) / scale
                orig_y1 = (y1 - pad_h) / scale
                orig_x2 = (x2 - pad_w) / scale
                orig_y2 = (y2 - pad_h) / scale
                
                results.append({
                    "bbox": [int(orig_x1), int(orig_y1), int(orig_x2), int(orig_y2)],
                    "confidence": float(conf),
                    "class_id": int(cls_id),
                    "class_name": CLASS_NAMES[int(cls_id)] if int(cls_id) < len(CLASS_NAMES) else "unknown"
                })
        return results

    # Original code path for (N, 84) or (84, N) output
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

    # Convert cx, cy, w, h to x, y, w, h for OpenCV NMS
    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1 = cx - w / 2
    y1 = cy - h / 2
    
    # Store boxes as [left, top, width, height]
    nms_boxes = np.column_stack((x1, y1, w, h)).tolist()
    
    # Run OpenCV NMS
    indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), conf_threshold, nms_threshold)
    
    for i in indices:
        idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
        # x1, y1, w, h
        x, y, bw, bh = nms_boxes[idx]
        conf = confidences[idx]
        cls_id = class_ids[idx]
        
        # Remove padding & rescale
        orig_x1 = (x - pad_w) / scale
        orig_y1 = (y - pad_h) / scale
        orig_x2 = (x + bw - pad_w) / scale
        orig_y2 = (y + bh - pad_h) / scale
        
        results.append({
            "bbox": [int(orig_x1), int(orig_y1), int(orig_x2), int(orig_y2)],
            "confidence": float(conf),
            "class_id": int(cls_id),
            "class_name": CLASS_NAMES[int(cls_id)] if int(cls_id) < len(CLASS_NAMES) else "unknown"
        })

    return results


def draw_detections(image, detections, time_ms):
    """Draw bounding boxes and labels on image."""
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        color = tuple(int(c) for c in COLORS[det["class_id"] % len(COLORS)])
        label = f"{det['class_name']} {det['confidence']:.2f}"

        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - th - 8), (x1 + tw, y1), color, -1)
        cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    cv2.putText(image, f"NCNN Latency: {time_ms:.1f}ms", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    return image


def run_inference(image_path, net):
    """Run YOLO inference via NCNN on a single image."""
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not read image '{image_path}'")
        return None, []

    # Preprocess
    mat_in, scale, pad_h, pad_w = preprocess(image, INPUT_SIZE)

    # Inference loop to time
    start = time.time()
    with net.create_extractor() as ex:
        # According to standard ultralytics ncnn export, input name is "in0"
        ex.input("in0", mat_in)
        # And output is "out0"
        _, mat_out = ex.extract("out0")
    t_ms = (time.time() - start) * 1000

    # Postprocess
    detections = postprocess(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)

    # Draw results
    annotated = draw_detections(image.copy(), detections, t_ms)

    return annotated, detections


if __name__ == "__main__":
    print("Loading NCNN model...")
    net = ncnn.Net()
    # use vulkan if available, but for pi cpu might be fine.
    net.opt.use_vulkan_compute = False 
    net.load_param(PARAM_PATH)
    net.load_model(BIN_PATH)
    print("Model loaded successfully!")

    images = [
        (os.path.join(SCRIPT_DIR, "images", "tripleriding.jpeg"), os.path.join(SCRIPT_DIR, "output_ncnn_tripleriding.jpg")),
        (os.path.join(SCRIPT_DIR, "images", "elephant.jpeg"), os.path.join(SCRIPT_DIR, "output_ncnn_elephant.jpg")),
    ]

    for img_path, out_path in images:
        print(f"\nProcessing: {img_path}")
        annotated, detections = run_inference(img_path, net)

        if annotated is not None:
            cv2.imwrite(out_path, annotated)
            print(f"  Detected {len(detections)} objects:")
            for d in detections:
                print(f"    - {d['class_name']} ({d['confidence']:.2f})")
            print(f"  Saved to: {out_path}")

    print("\nDone!")
