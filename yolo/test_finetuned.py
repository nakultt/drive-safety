import cv2
from ultralytics import YOLO

def main():
    # Load the finetuned model
    model_path = r"e:\Github\drive-safety\yolo\runs\detect\merged_pothole_helmet\weights\best.pt"
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)

    # Define the images to test
    images = [
        r"e:\Github\drive-safety\yolo\merged_dataset\train\images\hel_BikesHelmets577_png_jpg.rf.c325afe06917ac45175b77d111619942.jpg",
        r"e:\Github\drive-safety\yolo\merged_dataset\train\images\pot_296_png.rf.dcb409e04afbcb8e2a1a0bd60db05669.jpg"
    ]

    for i, img_path in enumerate(images):
        print(f"\nProcessing image: {img_path}")
        
        # Read the image using OpenCV
        img = cv2.imread(img_path)
        
        if img is None:
            print(f"Error: Could not read image {img_path}")
            continue
        
        # Run YOLOv8 inference 
        # (It automatically utilizes available GPU if configured, or falls back to CPU)
        results = model(img)
        
        # Get the annotated image with bounding boxes (returns a BGR numpy array)
        annotated_img = results[0].plot()
        
        # Save the resulting image
        output_filename = f"test_result_{i+1}.jpg"
        cv2.imwrite(output_filename, annotated_img)
        print(f"Saved detection result to {output_filename}")
        
        # Display the image in a window
        cv2.imshow(f"Detection Result {i+1} (Press any key to continue)", annotated_img)
        cv2.waitKey(0) # Wait infinitely until a key is pressed

    # Clean up windows
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
