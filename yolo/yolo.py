from ultralytics import YOLO # type: ignore
import cv2

model = YOLO("./yolo26n_ncnn_model")

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, verbose=True)

    annotated_frame = results[0].plot()

    cv2.imshow("YOLO NCNN Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()