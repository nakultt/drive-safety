"""
Merge pothole and helmet COCO datasets into a single YOLO-format dataset.

Class mapping:
  0 -> pothole
  1 -> with_helmet
  2 -> without_helmet
"""

import json
import shutil
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
POTHOLE_DIR = BASE_DIR / "pothole_finetune"
HELMET_DIR = BASE_DIR / "helmet_finetune"
OUTPUT_DIR = BASE_DIR / "merged_dataset"

# Class mapping for the merged dataset
# pothole dataset: COCO category id 1 -> "pothole" -> YOLO class 0
# helmet dataset: COCO category id 1 -> "With Helmet" -> YOLO class 1
#                 COCO category id 2 -> "Without Helmet" -> YOLO class 2

SPLITS = {
    "train": "train",
    "valid": "valid",
    "test": "test",
}


def coco_to_yolo_bbox(img_width, img_height, bbox):
    """Convert COCO bbox [x, y, w, h] to YOLO [x_center, y_center, w, h] (normalized)."""
    x, y, w, h = bbox
    x_center = (x + w / 2) / img_width
    y_center = (y + h / 2) / img_height
    w_norm = w / img_width
    h_norm = h / img_height
    # Clamp values to [0, 1]
    x_center = max(0, min(1, x_center))
    y_center = max(0, min(1, y_center))
    w_norm = max(0, min(1, w_norm))
    h_norm = max(0, min(1, h_norm))
    return x_center, y_center, w_norm, h_norm


def process_dataset(dataset_dir, split_name, output_dir, class_map, prefix):
    """
    Process a COCO dataset split and output YOLO format labels + copy images.
    
    Args:
        dataset_dir: Path to dataset root (e.g., pothole_finetune/)
        split_name: Split folder name (train, valid, test)
        output_dir: Merged output directory
        class_map: Dict mapping COCO category_id -> YOLO class_id
        prefix: Filename prefix to avoid collisions (e.g., "pot_" or "hel_")
    """
    split_dir = dataset_dir / split_name
    anno_file = split_dir / "_annotations.coco.json"
    
    if not anno_file.exists():
        print(f"  WARNING: {anno_file} not found, skipping.")
        return 0, 0
    
    with open(anno_file, "r") as f:
        coco_data = json.load(f)
    
    # Build image lookup: id -> image info
    images = {img["id"]: img for img in coco_data["images"]}
    
    # Group annotations by image_id
    annotations_by_image = {}
    for ann in coco_data["annotations"]:
        img_id = ann["image_id"]
        if img_id not in annotations_by_image:
            annotations_by_image[img_id] = []
        annotations_by_image[img_id].append(ann)
    
    # Output dirs
    img_out = output_dir / split_name / "images"
    lbl_out = output_dir / split_name / "labels"
    img_out.mkdir(parents=True, exist_ok=True)
    lbl_out.mkdir(parents=True, exist_ok=True)
    
    images_copied = 0
    annotations_written = 0
    
    for img_id, img_info in images.items():
        file_name = img_info["file_name"]
        img_w = img_info["width"]
        img_h = img_info["height"]
        
        src_img = split_dir / file_name
        if not src_img.exists():
            continue
        
        # Add prefix to avoid filename collisions
        new_name = prefix + file_name
        dst_img = img_out / new_name
        shutil.copy2(src_img, dst_img)
        images_copied += 1
        
        # Create YOLO label file
        label_name = Path(new_name).stem + ".txt"
        label_lines = []
        
        anns = annotations_by_image.get(img_id, [])
        for ann in anns:
            cat_id = ann["category_id"]
            if cat_id not in class_map:
                continue  # Skip unmapped categories (e.g., background)
            
            yolo_class = class_map[cat_id]
            bbox = ann["bbox"]
            x_c, y_c, w_n, h_n = coco_to_yolo_bbox(img_w, img_h, bbox)
            label_lines.append(f"{yolo_class} {x_c:.6f} {y_c:.6f} {w_n:.6f} {h_n:.6f}")
            annotations_written += 1
        
        with open(lbl_out / label_name, "w") as f:
            f.write("\n".join(label_lines))
    
    return images_copied, annotations_written


def main():
    # Clean output directory
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)
    
    print("=" * 60)
    print("Merging Pothole + Helmet datasets -> YOLO format")
    print("=" * 60)
    print(f"Output: {OUTPUT_DIR}")
    print()
    print("Class mapping:")
    print("  0 -> pothole")
    print("  1 -> with_helmet")
    print("  2 -> without_helmet")
    print()
    
    # Pothole class map: COCO cat_id -> YOLO class
    # Pothole dataset has cat 0 (background "pothole") and cat 1 (actual "pothole")
    # We only want cat_id 1 -> YOLO class 0
    pothole_class_map = {1: 0}
    
    # Helmet class map: COCO cat_id -> YOLO class
    # Cat 0 = "rider" (skip), Cat 1 = "With Helmet" -> class 1, Cat 2 = "Without Helmet" -> class 2
    helmet_class_map = {1: 1, 2: 2}
    
    total_images = 0
    total_annotations = 0
    
    for split_key, split_folder in SPLITS.items():
        print(f"--- Processing split: {split_folder} ---")
        
        # Process pothole dataset
        print(f"  Pothole dataset...")
        imgs, anns = process_dataset(
            POTHOLE_DIR, split_folder, OUTPUT_DIR, pothole_class_map, "pot_"
        )
        print(f"    -> {imgs} images, {anns} annotations")
        total_images += imgs
        total_annotations += anns
        
        # Process helmet dataset
        print(f"  Helmet dataset...")
        imgs, anns = process_dataset(
            HELMET_DIR, split_folder, OUTPUT_DIR, helmet_class_map, "hel_"
        )
        print(f"    -> {imgs} images, {anns} annotations")
        total_images += imgs
        total_annotations += anns
        
        print()
    
    # Create data.yaml
    data_yaml_content = f"""# Merged Pothole + Helmet Dataset
# Auto-generated by merge_datasets.py

path: {OUTPUT_DIR.resolve().as_posix()}
train: train/images
val: valid/images
test: test/images

nc: 3
names:
  0: pothole
  1: with_helmet
  2: without_helmet
"""
    
    data_yaml_path = OUTPUT_DIR / "data.yaml"
    with open(data_yaml_path, "w") as f:
        f.write(data_yaml_content)
    
    print("=" * 60)
    print(f"DONE! Merged dataset created at: {OUTPUT_DIR}")
    print(f"  Total images: {total_images}")
    print(f"  Total annotations: {total_annotations}")
    print(f"  data.yaml: {data_yaml_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
