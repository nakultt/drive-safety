import os
import cv2
import numpy as np
import ncnn
import time
from flask import Flask, Response, render_template_string

app = Flask(__name__)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- Configuration ----
PARAM_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.param")
BIN_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.bin")
CONFIDENCE_THRESHOLD = 0.25
NMS_THRESHOLD = 0.45
INPUT_SIZE = (640, 640)

# COCO class names
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

print("Loading NCNN model...")
net = ncnn.Net()
net.opt.use_vulkan_compute = False 
net.load_param(PARAM_PATH)
net.load_model(BIN_PATH)
print("Model loaded successfully!")

cap = cv2.VideoCapture(0)

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

def draw_detections(image, detections):
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        label = f'{det["class_name"]} {det["confidence"]:.2f}'
        
        # Draw bounding box
        color = (0, 255, 0)
        if det["class_name"] == "motorcycle":
            color = (0, 165, 255) # Orange
        elif det["class_name"] == "car":
            color = (255, 0, 0) # Blue
            
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    return image

def generate_frames():
    while True:
        start_time = time.time()
        success, frame = cap.read()
        if not success:
            break
        else:
            # Inference
            mat_in, scale, pad_h, pad_w = preprocess(frame, INPUT_SIZE)
            with net.create_extractor() as ex:
                ex.input("in0", mat_in)
                _, mat_out = ex.extract("out0")

            detections = postprocess(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
            
            # Draw
            annotated_frame = draw_detections(frame, detections)
            
            # FPS Overlay
            elapsed = time.time() - start_time
            fps = 1.0 / elapsed if elapsed > 0 else 0
            cv2.putText(annotated_frame, f"FPS: {fps:.1f}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Pi Camera Debug Stream</title>
    <style>
        body { background-color: #0d1117; color: white; font-family: sans-serif; text-align: center; padding-top: 50px; }
        img { border: 2px solid #30363d; border-radius: 8px; max-width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
    <h1>Local NCNN YOLO Detections</h1>
    <p>Live from python Pi Script at ~30 FPS (unthrottled for debug)</p>
    <div>
        <img src="{{ url_for('video_feed') }}" width="800">
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print("Starting debug stream on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
