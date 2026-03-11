import cv2
from ultralytics import YOLO

def main():
    # 1. Load the fine-tuned model
    model_path = r"C:\Users\ADMIN\OneDrive\Documents\drive-safety\runs\detect\merged_19_classes\weights\best.pt"
    try:
        model = YOLO(model_path)
        print(f"Loaded model from: {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Please check if the model path is correct and training has completed.")
        return

    # 2. Open the default webcam (0 is usually the built-in webcam)
    # If you have an external camera, you might need to try 1 or 2 instead of 0.
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open the webcam.")
        return
        
    print("Press 'q' to quit the webcam view.")

    # 3. Process video frames in a loop
    while True:
        # Read a frame from the webcam
        success, frame = cap.read()
        
        if not success:
            print("Failed to grab frame. Exiting...")
            break
            
        # 4. Run YOLOv8 inference on the frame
        # stream=True is highly recommended for live video to prevent memory leaks
        results = model.predict(source=frame, stream=True, conf=0.5) # Set confidence threshold to 50%
        
        # 5. Visualize the results on the frame
        for r in results:
            # ultralytics plot() function automatically draws bounding boxes & labels
            annotated_frame = r.plot()
            
            # Display the annotated frame
            cv2.imshow("YOLOv8 Live Detection (19 Classes)", annotated_frame)
            
        # 6. Check if the user pressed 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # 7. Clean up
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
