import ncnn
import cv2
import numpy as np
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARAM_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.param")
BIN_PATH = os.path.join(SCRIPT_DIR, "yolo26n_ncnn_model", "model.ncnn.bin")
IMAGE_PATH = os.path.join(SCRIPT_DIR, "images", "tripleriding.jpeg")

def preprocess(image, input_size=(640,640)):
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
    return mat_in

net = ncnn.Net()
net.load_param(PARAM_PATH)
net.load_model(BIN_PATH)

image = cv2.imread(IMAGE_PATH)
mat_in = preprocess(image)

with net.create_extractor() as ex:
    ex.input("in0", mat_in)
    _, mat_out = ex.extract("out0")
    
output = np.array(mat_out)
print("Shape:", output.shape)
if len(output.shape) == 3:
    output = output[0]

if len(output.shape) == 2 and output.shape[1] == 6:
    print("Found End-to-End [300, 6] format!")
    
    # Check the 4th and 5th columns to see which one is confidence vs class_id
    # We'll just print the first 15 rows
    for i in range(15):
        det = output[i]
        x1, y1, x2, y2, val1, val2 = det
        print(f"Row {i} - Box: [{x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f}], Val1: {val1:.4f}, Val2: {val2:.4f}")
else:
    print("Not standard end2end format")
