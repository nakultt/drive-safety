import os
import cv2
import numpy as np
import ncnn
import time
import requests
import json
import uuid
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- Configuration ----
PARAM_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.param")
BIN_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.bin")
CONFIDENCE_THRESHOLD = 0.25
NMS_THRESHOLD = 0.45
INPUT_SIZE = (640, 640)

# Backend configuration
BACKEND_URL = "http://localhost:8000"  # CHANGE THIS ON THE PI TO THE BACKEND'S IP (e.g., http://192.168.1.100:8000)
CAMERA_ID = "pi-cam-01"
CAMERA_SOURCE = "raspberry_pi"
LOCATION_LABEL = "Main Street Intersection"
GPS_LAT = 13.0827
GPS_LNG = 80.2707

# Detection cooldown (seconds) to prevent sending the same violation 10 times a second
COOLDOWN_SECONDS = 10 

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

def preprocess(image, input_size):
    h, w = image.shape[:2]
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (new_w, new_h))

    padded = np.full((input_size[0], input_size[1], 3), 114, dtype=np.uint8)
    pad_h = (input_size[0] - new_h) // 2
    pad_w = (input_size[1] - new_w) // 2
    padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized

    mat_in = ncnn.Mat.from_pixels(padded, ncnn.Mat.PixelType.PIXEL_BGR2RGB, padded.shape[1], padded.shape[0])
    
    mean_vals = [0.0, 0.0, 0.0]
    norm_vals = [1/255.0, 1/255.0, 1/255.0]
    mat_in.substract_mean_normalize(mean_vals, norm_vals)

    return mat_in, scale, pad_h, pad_w


def postprocess(mat_out, scale, pad_h, pad_w, conf_threshold, nms_threshold):
    output = np.array(mat_out)
    
    if len(output.shape) == 2 and output.shape[1] == 6:
        filtered_boxes = []
        filtered_confidences = []
        filtered_class_ids = []

        for det in output:
            if det[4] < 1.0 and det[5] > 1.0: 
                x1, y1, x2, y2, conf, cls_id = det
            else: 
                x1, y1, x2, y2, cls_id, conf = det
            
            if conf < conf_threshold:
                continue
            
            filtered_boxes.append([x1, y1, x2, y2])
            filtered_confidences.append(conf)
            filtered_class_ids.append(int(cls_id))

        boxes = np.array(filtered_boxes)
        confidences = np.array(filtered_confidences)
        class_ids = np.array(filtered_class_ids)

        if len(boxes) == 0:
            return []

        x = boxes[:, 0]
        y = boxes[:, 1]
        w = boxes[:, 2] - boxes[:, 0]
        h = boxes[:, 3] - boxes[:, 1]
        nms_boxes = np.column_stack((x, y, w, h)).tolist()

        indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), conf_threshold, nms_threshold)
        
        results = []
        if len(indices) > 0:
            for i in indices:
                idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
                x1, y1, x2, y2 = filtered_boxes[idx]
                conf = confidences[idx]
                cls_id = class_ids[idx]
                
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

    if len(output.shape) == 3:
        output = output[0]
    
    if output.shape[0] == 84:
        output = output.T

    boxes = output[:, :4]
    scores = output[:, 4:]

    class_ids = np.argmax(scores, axis=1)
    confidences = scores[np.arange(len(scores)), class_ids]

    mask = confidences > conf_threshold
    boxes = boxes[mask]
    confidences = confidences[mask]
    class_ids = class_ids[mask]

    results = []
    if len(boxes) == 0:
        return results

    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1 = cx - w / 2
    y1 = cy - h / 2
    
    nms_boxes = np.column_stack((x1, y1, w, h)).tolist()
    
    indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), conf_threshold, nms_threshold)
    
    for i in indices:
        idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
        x, y, bw, bh = nms_boxes[idx]
        conf = confidences[idx]
        cls_id = class_ids[idx]
        
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

def detect_violations(detections):
    """
    Map COCO detections to traffic violations.
    This is a naive implementation; replace with proper trained model later.
    """
    violations = []
    
    person_count = 0
    motorcycle_detected = False
    highest_conf = 0
    motorcycle_bbox = None

    for det in detections:
        name = det["class_name"]
        if name == "motorcycle":
            motorcycle_detected = True
            motorcycle_bbox = det["bbox"]
        elif name == "person":
             person_count += 1
             highest_conf = max(highest_conf, det["confidence"])

    # Example: If a motorcycle is detected with > 2 people, it's triple riding
    if motorcycle_detected and person_count >= 3:
         violations.append({
             "type": "triple_riding",
             "confidence": highest_conf,
             "bounding_boxes": [{"x": b["bbox"][0], "y": b["bbox"][1], "w": b["bbox"][2] - b["bbox"][0], "h": b["bbox"][3] - b["bbox"][1], "label": b["class_name"], "confidence": b["confidence"]} for b in detections if b["class_name"] in ["motorcycle", "person"]]
         })
    
    # Example: If a person is detected on a motorcycle (we assume no helmet as we don't have a helmet class in standard COCO)
    # IN A REAL SCENARIO, YOU WOULD USE A CUSTOM MODEL TRAINED ON HELMETS
    elif motorcycle_detected and person_count > 0:
        violations.append({
             "type": "helmet_absence",
             "confidence": highest_conf,
             "bounding_boxes": [{"x": b["bbox"][0], "y": b["bbox"][1], "w": b["bbox"][2] - b["bbox"][0], "h": b["bbox"][3] - b["bbox"][1], "label": b["class_name"], "confidence": b["confidence"]} for b in detections if b["class_name"] in ["motorcycle", "person"]]
         })
        
    return violations

def send_to_backend(frame, violation):
    """POSTs the frame and JSON data to the backend."""
    timestamp = datetime.now(timezone.utc).isoformat()
    
    event_data = {
        "violation_type": violation["type"],
        "confidence": float(violation["confidence"]),
        "timestamp": timestamp,
        "camera_source": CAMERA_SOURCE,
        "camera_id": CAMERA_ID,
        "gps_lat": GPS_LAT,
        "gps_lng": GPS_LNG,
        "location_label": LOCATION_LABEL,
        "bounding_boxes": violation["bounding_boxes"]
    }

    # Encode frame to JPEG
    ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    if not ret:
        print("Failed to encode image")
        return

    files = {
        "image": ("frame.jpg", buffer.tobytes(), "image/jpeg")
    }
    data = {
        "data": json.dumps(event_data)
    }

    try:
        response = requests.post(f"{BACKEND_URL}/api/events", files=files, data=data, timeout=5)
        response.raise_for_status()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Sent {violation['type']} violation to backend. Response: {response.status_code}")
    except requests.exceptions.RequestException as e:
         print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Failed to send to backend: {e}")

if __name__ == "__main__":
    print("Loading NCNN model...")
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False 
    net.load_param(PARAM_PATH)
    net.load_model(BIN_PATH)
    print("Model loaded successfully!")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open the video capture.")
        exit()

    last_sent_times = {}

    print("Starting detection loop (1 FPS)...")
    while True:
        start_time = time.time()
        
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame")
            time.sleep(1)
            continue

        mat_in, scale, pad_h, pad_w = preprocess(frame, INPUT_SIZE)

        with net.create_extractor() as ex:
            ex.input("in0", mat_in)
            _, mat_out = ex.extract("out0")

        detections = postprocess(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
        
        violations = detect_violations(detections)

        for violation in violations:
            v_type = violation["type"]
            current_time = time.time()
            
            # Check cooldown
            if v_type not in last_sent_times or (current_time - last_sent_times[v_type]) > COOLDOWN_SECONDS:
                send_to_backend(frame, violation)
                last_sent_times[v_type] = current_time
            else:
                 print(f"[{datetime.now().strftime('%H:%M:%S')}] ⏳ {v_type} detected, but in cooldown.")

        # Ensure we only process ~1 frame per second
        elapsed = time.time() - start_time
        sleep_time = max(0, 1.0 - elapsed)
        
        # Log frame activity
        det_summary = {}
        for d in detections:
            name = d["class_name"]
            det_summary[name] = det_summary.get(name, 0) + 1
            
        summary_str = ", ".join([f"{count} {name}s" for name, count in det_summary.items()]) if det_summary else "No relevant objects"
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Processed frame ({elapsed*1000:.1f}ms). Found: {summary_str}")
        
        time.sleep(sleep_time)
