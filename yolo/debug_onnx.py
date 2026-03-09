import onnxruntime as ort
import cv2
import numpy as np
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "yolo26n.onnx")
IMAGE_PATH = os.path.join(SCRIPT_DIR, "images", "input_tripleriding.jpeg") # assuming one of the images
if not os.path.exists(IMAGE_PATH):
    IMAGE_PATH = os.path.join(SCRIPT_DIR, "images", "tripleriding.jpeg")

session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])

image = cv2.imread(IMAGE_PATH)
h, w = image.shape[:2]
scale = min(640 / h, 640 / w)
new_h, new_w = int(h * scale), int(w * scale)
resized = cv2.resize(image, (new_w, new_h))
padded = np.full((640, 640, 3), 114, dtype=np.uint8)
pad_h, pad_w = (640 - new_h) // 2, (640 - new_w) // 2
padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized
blob = padded.astype(np.float32) / 255.0
blob = blob.transpose(2, 0, 1)
blob = np.expand_dims(blob, axis=0)

input_name = session.get_inputs()[0].name
output = session.run(None, {input_name: blob})
detections = output[0]

print("Raw output shape:", detections.shape)
if len(detections.shape) == 3:
    detections = detections[0]
if detections.shape[0] == 84:
    detections = detections.T
print("Transposed output shape:", detections.shape)

boxes = detections[:, :4]
scores = detections[:, 4:]

class_ids = np.argmax(scores, axis=1)
confidences = scores[np.arange(len(scores)), class_ids]

print("Top 10 confidences without thresholding:")
top10_idx = np.argsort(confidences)[::-1][:10]
for idx in top10_idx:
    print(f"Conf: {confidences[idx]:.4f}, Class ID: {class_ids[idx]}, Box: {boxes[idx]}")

mask = confidences > 0.5
boxes = boxes[mask]
confidences = confidences[mask]
class_ids = class_ids[mask]

print(f"Boxes passing threshold: {len(boxes)}")

if len(boxes) > 0:
    cx, cy, w, h = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    x1, y1 = cx - w / 2, cy - h / 2
    nms_boxes = np.column_stack((x1, y1, w, h)).tolist()
    
    # Try different OpenCV NMS variants or native numpy if score format is weird
    indices = cv2.dnn.NMSBoxes(nms_boxes, confidences.tolist(), 0.5, 0.45)
    print(f"Boxes after NMS: {len(indices)}")
    
    for i in indices:
        idx = i if isinstance(i, np.integer) or isinstance(i, int) else i[0]
        print(f"Selected Box - Conf: {confidences[idx]:.4f}, Class: {class_ids[idx]}")
