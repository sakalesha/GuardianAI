import base64
import cv2
import numpy as np
import os
import urllib.request
from io import BytesIO
from PIL import Image
from ultralytics import YOLO

# =============================================================================
# CIVICPROOF VISUAL VERIFICATION SYSTEM (UPGRADED VERSION)
# =============================================================================
# Focus: Municipal Issues, Potholes, Waste, and Infrastructure.
# Features: Lighting Enhancement, Context Filtering, and Custom Weight Support.
# =============================================================================

print("Step 1: Initializing AI Layer...")

# Path to our pre-trained weights
# We use absolute paths to ensure it works regardless of where the script is started.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # points to 'ml/'
CUSTOM_MODEL_PATH = os.path.join(BASE_DIR, 'civic_v1.pt')
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, 'yolov8n.pt')

try:
    if os.path.exists(CUSTOM_MODEL_PATH):
        print(f"Loading CUSTOM Civic Model: {CUSTOM_MODEL_PATH}")
        detection_model = YOLO(CUSTOM_MODEL_PATH)
    else:
        print(f"Custom model not found. Using Standard weights: {DEFAULT_MODEL_PATH}")
        detection_model = YOLO(DEFAULT_MODEL_PATH)
    print("AI Model loaded successfully.")
    print(f"Model Classes: {detection_model.names}")
except Exception as error:
    print(f"CRITICAL ERROR: Could not load AI weights: {error}")
    detection_model = None

def enhance_image_for_ai(image):
    """
    CONCEPT: Many civic photos are taken in bad lighting (dark shadows/bright sun).
    This function uses CLAHE (Contrast Limited Adaptive Histogram Equalization)
    to normalize the lighting and a sharpening kernel to make edges crisper.
    """
    if image is None:
        return None
    # 1. Convert to YUV color space to process only the "Lightness" channel
    yuv_img = cv2.cvtColor(image, cv2.COLOR_BGR2YUV)
    
    # 2. Apply CLAHE to the Y channel (brightness)
    clahe_engine = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    yuv_img[:,:,0] = clahe_engine.apply(yuv_img[:,:,0])
    
    # 3. Convert back to standard BGR
    enhanced_img = cv2.cvtColor(yuv_img, cv2.COLOR_YUV2BGR)
    
    # 4. Subtle Sharpening (helps with small cracks or textures)
    sharpening_kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    final_img = cv2.filter2D(enhanced_img, -1, sharpening_kernel)
    
    return final_img

def map_to_civic_category(class_name):
    """
    CONCEPT: Standard AI identifies 80 things. We map those into 
    Civic Categories that a Municipal Officer would care about.
    """
    # --- URBAN MAINTENANCE TARGETS (Custom Model) ---
    # Map both names and common indices (0 is often 'pothole' in custom models)
    if class_name in ['pothole', 'potholes', '0', 0]:
        return "ROAD_DAMAGE_DETECTED"
    if class_name in ['garbage', 'trash', 'litter', 'waste', '1', 1]:
        return "WASTE_MANAGEMENT_ISSUE"
    if class_name in ['graffiti', 'vandalism']:
        return "PUBLIC_VANDALISM"
    if class_name in ['broken_streetlight', 'lamp_out']:
        return "STREETLIGHT_REPAIR_NEEDED"

    # --- GENERIC PROXIES (Standard YOLO) ---
    # Group 1: Traffic & Vehicle Obstructions
    if class_name in ['car', 'truck', 'bus', 'motorcycle', 'bicycle']:
        return "TRAFFIC_OR_PARKING_ISSUE"
        
    # Group 2: Public Infrastructure
    if class_name in ['traffic light', 'fire hydrant', 'stop sign', 'bench']:
        return "MUNICIPAL_INFRASTRUCTURE"
        
    # Group 3: Litter and Illegal Dumping
    if class_name in ['bottle', 'cup', 'backpack', 'handbag', 'suitcase', 'chair', 'couch', 'bed', 'toilet', 'refrigerator']:
        return "WASTE_OR_LITTER_ISSUE"
        
    # If it's a person, dog, or pizza, we return None (Ignore it)
    return None

def load_image_from_any_source(source_string):
    """
    Handles both Cloudinary URLs (http) and Base64 strings.
    Converts them into a numerical OpenCV grid for AI processing.
    """
    if not source_string or not isinstance(source_string, str):
        return None

    # CASE 1: Cloudinary/Web URL
    if source_string.startswith("http"):
        try:
            # We download the image into a temporary buffer
            # Adding a User-Agent to avoid being blocked by Cloudinary or other CDNs
            req = urllib.request.Request(source_string, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            image_data = response.read()
            numerical_array = np.frombuffer(image_data, np.uint8)
            opencv_image = cv2.imdecode(numerical_array, cv2.IMREAD_COLOR)
            if opencv_image is not None:
                print(f"DEBUG: Successfully loaded image from URL. Size: {opencv_image.shape}")
            else:
                print("DEBUG: Failed to decode image from URL.")
            return opencv_image
        except Exception as e:
            print(f"DEBUG: Error fetching image from URL: {e}")
            return None

    # CASE 2: Base64 String (from Browser)
    if "base64," in source_string:
        source_string = source_string.split("base64,")[1]
    
    try:
        binary_image_data = base64.b64decode(source_string)
        numerical_array = np.frombuffer(binary_image_data, np.uint8)
        opencv_image = cv2.imdecode(numerical_array, cv2.IMREAD_COLOR)
        return opencv_image
    except Exception:
        return None

def perform_object_detection(image):
    """
    Analyze the image with localized pre-processing and civic filtering.
    """
    if detection_model is None or image is None:
        return []
        
    # STAGE 1: Enhance the image (Light & Sharpness) before AI looks at it
    processed_image = enhance_image_for_ai(image)
    
    # STAGE 2: Run AI Inference
    inference_results = detection_model(processed_image, verbose=False)
    
    civic_detections = []
    
    for result in inference_results:
        for box in result.boxes:
            confidence = float(box.conf[0])
            raw_label = detection_model.names[int(box.cls[0])]

            # We ONLY care about objects the AI is at least 30% sure about
            if confidence < 0.30:
                continue
                
            # STAGE 3: Filter for Civic Relevance
            civic_label = map_to_civic_category(raw_label)
            
            if civic_label:
                civic_detections.append({
                    "label": civic_label,
                    "original_object": raw_label,
                    "confidence": confidence,
                    "box": box.xyxy[0].tolist()
                })
            
    return civic_detections

def calculate_background_similarity(image_one, image_two):
    """
    CONCEPT: Feature Matching (ORB).
    Instead of comparing the whole image, we look for "Keypoints" 
    (distinctive corners, edges, or patterns) that exist in both photos.
    This helps us confirm it's the same place even if the lighting changes.
    """
    if image_one is None or image_two is None:
        return 0.0

    # Create the ORB detector (Oriented FAST and Rotated BRIEF)
    # We ask it to find up to 1000 interesting points in the image.
    orb_engine = cv2.ORB_create(nfeatures=1000)
    
    # Find keypoints (where) and descriptors (what they look like) for both images
    keypoints_one, descriptors_one = orb_engine.detectAndCompute(image_one, None)
    keypoints_two, descriptors_two = orb_engine.detectAndCompute(image_two, None)
    
    # Defensive check: if an image is solid black or blurry, we might find no points
    if descriptors_one is None or descriptors_two is None:
        return 0.0
        
    # Create a "Matcher" object to find identical points between the two images
    # We use NORM_HAMMING because it works best with the ORB method
    brute_force_matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    
    # Try to match the points from Image A to Image B
    # Note: crossCheck=True finds unique matches that exist in both directions
    raw_matches = brute_force_matcher.match(descriptors_one, descriptors_two)
    
    # Calculate final score (Success Rate)
    # 1.0 = Perfect duplicate, 0.0 = Totally different world
    # We use the minimum number of keypoints to normalize the score fairly
    total_keypoints = min(len(keypoints_one), len(keypoints_two))
    
    if total_keypoints == 0:
        print("DEBUG: One or both images have zero keypoints.")
        return 0.0

    match_score = len(raw_matches) / total_keypoints
    
    print(f"DEBUG: Background Match Details - Keypoints: ({len(keypoints_one)}, {len(keypoints_two)}), Valid Matches: {len(raw_matches)}, Score: {match_score:.2f}")

    return float(match_score)

def analyze_image(img_source):
    """
    Public function for checking a single image (e.g., initial citizen upload).
    """
    try:
        image = load_image_from_any_source(img_source)
        detections = perform_object_detection(image)
        
        return {
            "success": True,
            "detections": detections,
            "has_issue": len(detections) > 0 # At least one object was found
        }
    except Exception as error:
        return {"success": False, "error": str(error)}

def verify_resolution_images(before_source, after_source):
    """
    The main logic to decide if a worker actually fixed the problem.
    """
    try:
        # Convert both inputs (URL or Base64) into OpenCV format
        # OpenCV format: representing an image as a matrix of numbers and Color Order (BGR)
        image_before = load_image_from_any_source(before_source)
        image_after = load_image_from_any_source(after_source)
        
        # STAGE 1: Confirm it's the same physical location
        background_score = calculate_background_similarity(image_before, image_after)
        
        # STAGE 2: Identify what objects are in both images
        detections_before = perform_object_detection(image_before)
        detections_after = perform_object_detection(image_after)
        
        # STAGE 3: Final Logic (Decision Making)
        
        # Threshold: 0.45 is a high confidence that background matches
        if background_score > 0.45:
            # Situation A: Something was there before, now nothing is there.
            if len(detections_before) > 0 and len(detections_after) == 0:
                final_label = "VERIFIED_RESOLUTION"
                explanation = f"High background match ({background_score:.2f}). The issue is gone."
            
            # Situation B: Something was there, and something is still there.
            elif len(detections_before) > 0 and len(detections_after) > 0:
                final_label = "NEEDS_HUMAN_REVIEW"
                explanation = f"Background matches ({background_score:.2f}), but objects are still visible."
            
            # Situation C: Nothing was detected in either (Background still matches)
            else:
                final_label = "VERIFIED_TENTATIVE"
                explanation = f"Same location ({background_score:.2f}), but AI didn't catch specific objects."
                
        # Situation D: Background matches a little bit, but not enough to be sure.
        elif background_score > 0.20:
            final_label = "UNCERTAIN_LOCATION"
            explanation = "The background looks similar, but the angle might be too different."
            
        # Situation E: Background is completely different.
        else:
            final_label = "SUSPICIOUS_DIFFERENT_LOCATION"
            explanation = "The background does not match. These photos are likely from different places."
            
        return {
            "score": background_score,
            "label": final_label,
            "reasoning": explanation,
            "before_detections": detections_before,
            "after_detections": detections_after
        }
        
    except Exception as error:
        return {
            "score": 0.0,
            "label": "ERROR",
            "reasoning": f"An error occurred during AI analysis: {str(error)}"
        }
