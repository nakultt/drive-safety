"""
Train YOLOv8 on the merged COCO + pothole + helmet dataset (19 classes).
"""

from ultralytics import YOLO
from pathlib import Path

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "yolo26n.pt"
DATA_YAML = BASE_DIR / "final_data.yaml"

def main():
    # Load the model
    model = YOLO(str(MODEL_PATH))
    
    print("=" * 60)
    print("Training YOLO on Merged Dataset (19 Classes)")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Data: {DATA_YAML}")
    print("=" * 60)
    
    # Train the model
    results = model.train(
        data=str(DATA_YAML),
        epochs=50,
        imgsz=640,
        batch=8,
        name="merged_19_classes",
        patience=10,
        save=True,
        plots=True,
        verbose=True,
    )
    
    print("\nTraining complete!")
    if hasattr(results, 'save_dir'):
        print(f"Best model saved to: {results.save_dir}/weights/best.pt")

if __name__ == "__main__":
    main()
