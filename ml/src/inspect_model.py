from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUSTOM_MODEL_PATH = os.path.join(BASE_DIR, 'civic_v1.pt')

if os.path.exists(CUSTOM_MODEL_PATH):
    model = YOLO(CUSTOM_MODEL_PATH)
    print(f"Model Classes: {model.names}")
else:
    print("Custom model not found.")
