"""
Convert COCO format annotations to YOLO format.
This script reads _annotations.coco.json from each split (train/valid/test)
and creates corresponding .txt label files for YOLO training.

YOLO format: <class_id> <x_center> <y_center> <width> <height>
All values are normalized to [0, 1].
"""

import json
import os


DATASET_DIR = os.path.join(os.path.dirname(__file__), "finetuning_dataset")
SPLITS = ["train", "valid", "test"]


def convert_coco_to_yolo(dataset_dir, splits):
    for split in splits:
        split_dir = os.path.join(dataset_dir, split)
        coco_json_path = os.path.join(split_dir, "_annotations.coco.json")

        if not os.path.exists(coco_json_path):
            print(f"[SKIP] No annotation file found in {split_dir}")
            continue

        with open(coco_json_path, "r") as f:
            coco = json.load(f)

        # Create labels directory inside the split folder
        labels_dir = os.path.join(split_dir, "labels")
        os.makedirs(labels_dir, exist_ok=True)

        # Build a lookup: image_id -> image info
        images = {img["id"]: img for img in coco["images"]}

        # Group annotations by image_id
        annotations_by_image = {}
        for ann in coco["annotations"]:
            img_id = ann["image_id"]
            if img_id not in annotations_by_image:
                annotations_by_image[img_id] = []
            annotations_by_image[img_id].append(ann)

        converted = 0
        for img_id, img_info in images.items():
            img_w = img_info["width"]
            img_h = img_info["height"]
            file_name = img_info["file_name"]

            # Label file has same name as image but with .txt extension
            label_name = os.path.splitext(file_name)[0] + ".txt"
            label_path = os.path.join(labels_dir, label_name)

            anns = annotations_by_image.get(img_id, [])

            with open(label_path, "w") as lf:
                for ann in anns:
                    # COCO bbox: [x_min, y_min, width, height] (absolute pixels)
                    bx, by, bw, bh = ann["bbox"]

                    # Convert to YOLO format: center_x, center_y, width, height (normalized)
                    x_center = (bx + bw / 2) / img_w
                    y_center = (by + bh / 2) / img_h
                    w = bw / img_w
                    h = bh / img_h

                    # All potholes are class 0
                    lf.write(f"0 {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}\n")

            converted += 1

        print(f"[{split.upper()}] Converted {converted} label files -> {labels_dir}")


if __name__ == "__main__":
    print("Converting COCO annotations to YOLO format...")
    print(f"Dataset directory: {DATASET_DIR}\n")
    convert_coco_to_yolo(DATASET_DIR, SPLITS)
    print("\nDone! You can now run train.py to start training.")
