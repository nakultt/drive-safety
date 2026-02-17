from ultralytics import YOLO # type: ignore

model = YOLO("yolo26n.pt")
model.export(format="ncnn")
ncnn_model = YOLO("yolo26n_ncnn_model")
results = ncnn_model("https://ultralytics.com/images/bus.jpg")