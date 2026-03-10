"""
Fine-tune YOLOv8 (yolo26n.pt) on the Pothole Detection dataset.

Prerequisites:
  1. Run convert_coco_to_yolo.py first to generate YOLO label files.
  2. pip install ultralytics

Usage:
  python train.py
"""

from ultralytics import YOLO

# --- Configuration ---
MODEL_PATH = "yolo26n.pt"                    # Pre-trained model to fine-tune
DATA_YAML = "finetuning_dataset/data.yaml"   # Dataset config
EPOCHS = 10                                  # Number of training epochs
IMG_SIZE = 640                               # Input image size
BATCH_SIZE = 8                               # Batch size (reduced for CPU training)
PROJECT = "pothole_training"                 # Output folder name
NAME = "yolo26n_pothole"                     # Run name

# --- Train ---
if __name__ == "__main__":
    print("Loading model:", MODEL_PATH)
    model = YOLO(MODEL_PATH)

    print("Starting training...")
    results = model.train(
        data=DATA_YAML,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=PROJECT,
        name=NAME,
        patience=10,         # Early stopping: stop if no improvement for 10 epochs
        save=True,           # Save checkpoints
        plots=True,          # Generate training plots
    )

    print("\nTraining complete!")
    print(f"Best model saved to: {PROJECT}/{NAME}/weights/best.pt")
