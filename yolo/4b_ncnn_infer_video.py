"""
Step 4: NCNN Inference on Videos
==================================
Runs YOLO object detection on a video stream using NCNN natively.
Requires OpenCV to read and write the video frames.

Install: pip install ncnn numpy opencv-python

Usage:
    python 4_ncnn_infer_video.py --video path/to/video.mp4 --output output.mp4
    # To use a webcam:
    python 4_ncnn_infer_video.py --video 0
"""

import argparse
import numpy as np
import ncnn
import time
import cv2
import os

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

np.random.seed(42)
COLORS = np.random.randint(0, 255, size=(len(CLASS_NAMES), 3), dtype=np.uint8)

def preprocess(image, input_size):
    """Resize and pad image using OpenCV."""
    h, w = image.shape[:2]
    scale = min(input_size[0] / h, input_size[1] / w)
    new_h, new_w = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (new_w, new_h))

    padded = np.full((input_size[0], input_size[1], 3), 114, dtype=np.uint8)
    pad_h = (input_size[0] - new_h) // 2
    pad_w = (input_size[1] - new_w) // 2
    padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized

    mat_in = ncnn.Mat.from_pixels(padded, ncnn.Mat.PixelType.PIXEL_BGR2RGB, padded.shape[1], padded.shape[0])
    mean_vals, norm_vals = [0.0, 0.0, 0.0], [1/255.0, 1/255.0, 1/255.0]
    mat_in.substract_mean_normalize(mean_vals, norm_vals)
    return mat_in, scale, pad_h, pad_w


def postprocess(mat_out, scale, pad_h, pad_w, conf_threshold, nms_threshold):
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

    results = []
    if len(boxes) == 0: return results

    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1, y1 = cx - w / 2, cy - h / 2
    
    nms_boxes = np.column_stack((x1, y1, w, h)).tolist()
    indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), conf_threshold, nms_threshold)
    
    for i in indices:
        idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
        x, y, bw, bh = nms_boxes[idx]
        
        orig_x1 = (x - pad_w) / scale
        orig_y1 = (y - pad_h) / scale
        orig_x2 = (x + bw - pad_w) / scale
        orig_y2 = (y + bh - pad_h) / scale
        
        results.append({
            "bbox": [int(orig_x1), int(orig_y1), int(orig_x2), int(orig_y2)],
            "confidence": float(confidences[idx]),
            "class_id": int(class_ids[idx]),
            "class_name": CLASS_NAMES[int(class_ids[idx])] if int(class_ids[idx]) < len(CLASS_NAMES) else "unknown"
        })
    return results


def draw_detections(image, detections, fps):
    """Draw bounding boxes and labels on image."""
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        color = tuple(int(c) for c in COLORS[det["class_id"] % len(COLORS)])
        label = f"{det['class_name']} {det['confidence']:.2f}"

        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - th - 8), (x1 + tw, y1), color, -1)
        cv2.putText(image, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    cv2.putText(image, f"NCNN FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
    return image


def process_video(video_source, net, output_path=None):
    from vidgear.gears import CamGear

    # Initialize CamGear stream
    # If video_source is a digit (e.g. "0"), CamGear handles it as webcam
    # Provide appropriate options for high performance
    options = {"THREADED_QUEUE_MODE": True}
    print(f"Starting Video Stream from: {video_source}")
    stream = CamGear(source=video_source, logging=True, **options).start()

    writer = None
    if output_path:
        from vidgear.gears import WriteGear
        # Define writer with appropriate settings
        output_params = {"-input_framerate": stream.framerate}
        writer = WriteGear(output=output_path, logging=True, **output_params)

    print("Processing video stream... Press 'q' to quit.")
    
    while True:
        frame = stream.read()
        if frame is None:
            break

        start = time.time()
        
        # Inference
        mat_in, scale, pad_h, pad_w = preprocess(frame, INPUT_SIZE)
        with net.create_extractor() as ex:
            ex.input("in0", mat_in)
            _, mat_out = ex.extract("out0")
        
        detections = postprocess(mat_out, scale, pad_h, pad_w, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
        
        fps_info = 1.0 / (time.time() - start)
        annotated = draw_detections(frame, detections, fps_info)

        # Show frame
        cv2.imshow("NCNN YOLO Video", annotated)
        if writer:
            writer.write(annotated)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    stream.stop()
    if writer:
        writer.close()
    cv2.destroyAllWindows()


def main():
    print("Loading NCNN model...")
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False 
    net.load_param(PARAM_PATH)
    net.load_model(BIN_PATH)
    print("Model loaded successfully!")
    
    # Hardcoded to use webcam 0. Change to a file path if you want to test a video file (e.g., "video.mp4")
    video_source = 0
    output_path = "" # Set to "output.mp4" to save
    
    process_video(video_source, net, output_path)

if __name__ == "__main__":
    main()
