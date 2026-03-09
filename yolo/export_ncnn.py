from ultralytics import YOLO

print("Loading YOLOv8 model...")
model = YOLO("yolo26n.pt")

print("Exporting to NCNN format...")
# export to ncnn
model.export(format="ncnn")

print("Export complete!")
