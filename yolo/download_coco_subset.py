import fiftyone.zoo as foz
import fiftyone as fo

# Set the database port explicitly to avoid Windows reserved port errors
fo.config.database_port = 27017

# Specify only the COCO classes you want
needed_coco_classes = [
    "person", "bicycle", "car", "motorcycle", "bus", "truck",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", 
    "bear", "zebra", "giraffe"
]

print("Loading train dataset...")
train_dataset = foz.load_zoo_dataset(
    "coco-2017",
    split="train",
    classes=needed_coco_classes,      # filters only these classes
    max_samples=3000,                  # limit sample count
    label_types=["detections"]
)

# Export to YOLO format
print("Exporting train dataset to YOLO format...")
train_dataset.export(
    export_dir="coco_subset/train",
    dataset_type=fo.types.YOLOv5Dataset,
    classes=needed_coco_classes
)

print("Loading validation dataset...")
val_dataset = foz.load_zoo_dataset(
    "coco-2017",
    split="validation",
    classes=needed_coco_classes,      # filters only these classes
    max_samples=500,                   # limit sample count (usually smaller for validation)
    label_types=["detections"]
)

# Export to YOLO format
print("Exporting validation dataset to YOLO format...")
val_dataset.export(
    export_dir="coco_subset/validation",
    dataset_type=fo.types.YOLOv5Dataset,
    classes=needed_coco_classes
)

print("Done!")
