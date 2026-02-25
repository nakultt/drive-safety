from ultralytics import YOLO # type: ignore
import cv2

model = YOLO("./yolo26n_ncnn_model")

frame="./images/tripleriding.jpeg"
results = model(frame, verbose=True)

frame1="./images/elephant.jpeg"
results1 = model(frame1, verbose=True)

annotated_frame = results[0].plot()
annotated_frame1 = results1[0].plot()

cv2.imshow("YOLO NCNN Detection 1", annotated_frame)
cv2.imshow("YOLO NCNN Detection 2", annotated_frame1)

cv2.waitKey(0)
cv2.destroyAllWindows()
