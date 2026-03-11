import os
import json
import shutil
import urllib.request
from tqdm import tqdm
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Paths
BASE_DIR = Path("c:/Users/ADMIN/OneDrive/Documents/drive-safety/yolo")
OLD_MERGED_DIR = BASE_DIR / "merged_dataset"
NEW_MERGED_DIR = BASE_DIR / "final_merged_dataset"

# Create directories
for split in ["train", "valid", "test"]:
    (NEW_MERGED_DIR / split / "images").mkdir(parents=True, exist_ok=True)
    (NEW_MERGED_DIR / split / "labels").mkdir(parents=True, exist_ok=True)

# 1. Process Existing Merged Dataset
# Remap: 0->16 (pothole), 1->17 (with_helmet), 2->18 (without_helmet)
print("Processing existing merged_dataset...")
for split in ["train", "valid", "test"]:
    src_images = OLD_MERGED_DIR / split / "images"
    src_labels = OLD_MERGED_DIR / split / "labels"
    dst_images = NEW_MERGED_DIR / split / "images"
    dst_labels = NEW_MERGED_DIR / split / "labels"
    
    if not src_images.exists():
        continue
        
    # Copy images
    for img_file in src_images.glob("*.*"):
        shutil.copy(img_file, dst_images / img_file.name)
        
    # Process Labels
    if src_labels.exists():
        for txt_file in src_labels.glob("*.txt"):
            with open(txt_file, "r") as f:
                lines = f.readlines()
            
            with open(dst_labels / txt_file.name, "w") as f:
                for line in lines:
                    parts = line.strip().split()
                    if not parts:
                        continue
                    class_id = int(parts[0])
                    new_class_id = class_id + 16
                    f.write(f"{new_class_id} " + " ".join(parts[1:]) + "\n")

# 2. Process COCO Data
COCO_RAW_DIR = Path("C:/Users/ADMIN/fiftyone/coco-2017/raw")
COCO_CLASSES_WANTED = [
    "person", "bicycle", "car", "motorcycle", "bus", "truck",
    "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", 
    "bear", "zebra", "giraffe"
]

def load_coco_annotations(json_path):
    print(f"Loading {json_path}...")
    with open(json_path, "r") as f:
        data = json.load(f)
    print("Loaded.")
    return data

def process_image(img_id, img_id_to_info, img_to_anns, cat_id_to_new_id, dst_images, dst_labels):
    img_info = img_id_to_info[img_id]
    img_url = img_info['coco_url']
    filename = img_info['file_name']
    img_path = dst_images / filename
    label_path = dst_labels / filename.replace(".jpg", ".txt")
    
    # Download or copy image
    if not img_path.exists():
        cached_train = Path("C:/Users/ADMIN/fiftyone/coco-2017/train/data") / filename
        cached_val = Path("C:/Users/ADMIN/fiftyone/coco-2017/validation/data") / filename
        if cached_train.exists():
            shutil.copy(cached_train, img_path)
        elif cached_val.exists():
            shutil.copy(cached_val, img_path)
        else:
            try:
                urllib.request.urlretrieve(img_url, img_path)
            except Exception as e:
                return False, f"Failed to download {img_url}: {e}"
            
    # Write YOLO labels
    anns = img_to_anns.get(img_id, [])
    with open(label_path, "w") as f:
        for ann in anns:
            cat_id = ann['category_id']
            if cat_id not in cat_id_to_new_id: continue
            new_id = cat_id_to_new_id[cat_id]
            
            x_min, y_min, w, h = ann['bbox']
            img_w, img_h = img_info['width'], img_info['height']
            
            x_center = (x_min + w / 2) / img_w
            y_center = (y_min + h / 2) / img_h
            w_norm = w / img_w
            h_norm = h / img_h
            
            f.write(f"{new_id} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}\n")
    return True, filename

def process_coco(split_name, coco_json_path, target_split, max_samples):
    data = load_coco_annotations(coco_json_path)
    
    wanted_cat_names = set(COCO_CLASSES_WANTED)
    wanted_cat_ids = []
    cat_id_to_new_id = {}
    for cat in data['categories']:
        if cat['name'] in wanted_cat_names:
            wanted_cat_ids.append(cat['id'])
            cat_id_to_new_id[cat['id']] = COCO_CLASSES_WANTED.index(cat['name'])
    
    img_to_anns = {}
    for ann in data['annotations']:
        if ann['category_id'] in wanted_cat_ids:
            img_id = ann['image_id']
            if img_id not in img_to_anns:
                img_to_anns[img_id] = []
            img_to_anns[img_id].append(ann)
            
    img_id_to_info = {img['id']: img for img in data['images']}
    
    cached_train_files = {f.name for f in Path("C:/Users/ADMIN/fiftyone/coco-2017/train/data").glob("*.jpg")} if Path("C:/Users/ADMIN/fiftyone/coco-2017/train/data").exists() else set()
    
    wanted_image_ids_cached = []
    wanted_image_ids_uncached = []
    for img_id in list(img_to_anns.keys()):
        if img_id_to_info[img_id]['file_name'] in cached_train_files:
            wanted_image_ids_cached.append(img_id)
        else:
            wanted_image_ids_uncached.append(img_id)
            
    wanted_image_ids = (wanted_image_ids_cached + wanted_image_ids_uncached)[:max_samples]
    
    dst_images = NEW_MERGED_DIR / target_split / "images"
    dst_labels = NEW_MERGED_DIR / target_split / "labels"
    
    print(f"Downloading/Copying {len(wanted_image_ids)} images for {target_split} using ThreadPool...")
    with ThreadPoolExecutor(max_workers=32) as executor:
        futures = [executor.submit(process_image, img_id, img_id_to_info, img_to_anns, cat_id_to_new_id, dst_images, dst_labels) for img_id in wanted_image_ids]
        for f in tqdm(as_completed(futures), total=len(wanted_image_ids)):
            success, msg = f.result()
            if not success:
                pass

# Process Train
process_coco("train2017", COCO_RAW_DIR / "instances_train2017.json", "train", 3000)

# Process Val
print("Splitting val2017 into valid and test sets...")
try:
    data = load_coco_annotations(COCO_RAW_DIR / "instances_val2017.json")
    wanted_cat_names = set(COCO_CLASSES_WANTED)
    wanted_cat_ids = []
    cat_id_to_new_id = {}
    for cat in data['categories']:
        if cat['name'] in wanted_cat_names:
            wanted_cat_ids.append(cat['id'])
            cat_id_to_new_id[cat['id']] = COCO_CLASSES_WANTED.index(cat['name'])
            
    img_to_anns = {}
    for ann in data['annotations']:
        if ann['category_id'] in wanted_cat_ids:
            img_id = ann['image_id']
            if img_id not in img_to_anns:
                img_to_anns[img_id] = []
            img_to_anns[img_id].append(ann)
            
    wanted_image_ids = list(img_to_anns.keys())
    val_ids = wanted_image_ids[:500]
    test_ids = wanted_image_ids[500:1000]
    
    img_id_to_info = {img['id']: img for img in data['images']}
    
    def dl_and_write(img_ids, target_split):
        dst_images = NEW_MERGED_DIR / target_split / "images"
        dst_labels = NEW_MERGED_DIR / target_split / "labels"
        print(f"Downloading {len(img_ids)} images for {target_split} using ThreadPool...")
        with ThreadPoolExecutor(max_workers=32) as executor:
            futures = [executor.submit(process_image, img_id, img_id_to_info, img_to_anns, cat_id_to_new_id, dst_images, dst_labels) for img_id in img_ids]
            for f in tqdm(as_completed(futures), total=len(img_ids)):
                pass

    dl_and_write(val_ids, "valid")
    dl_and_write(test_ids, "test")
except Exception as e:
    print("Error processing validation annotations:", e)

print("Dataset unification complete!")
