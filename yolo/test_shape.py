from yolo26n_ncnn_model.model_ncnn import test_inference
out = test_inference()
print("Output shape:", out.shape)
