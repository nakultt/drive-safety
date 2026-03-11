import cv2
from ultralytics import YOLO

def main():
    # Load the finetuned model
    model_path = r"e:\Github\drive-safety\yolo\runs\detect\merged_pothole_helmet\weights\best.pt"
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)

    # Initialize webcam (0 is generally the default built-in camera)
    cap = cv2.VideoCapture(0)
    
    # Check if the webcam is opened correctly
    if not cap.isOpened():
        print("Error: Could not open the webcam.")
        return

    print("Starting webcam... Press 'q' to quit.")
    
    # Process frames continuously
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Failed to grab a frame from the webcam.")
            break
            
        # Run YOLOv8 inference on the current frame
        # verbose=False prevents the console from being spammed with frame-by-frame inference stats
        results = model(frame, verbose=False)

        # Get the annotated frame with bounding boxes
        annotated_frame = results[0].plot()

        # Display the frame in a window
        cv2.imshow("YOLOv8 Webcam Inference", annotated_frame)

        # Break the loop when 'q' is pressed
        # waitKey(1) waits for 1 ms for a key event
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Clean up
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
