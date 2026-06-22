from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Ensure the app can import from src/
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from visual_detector import verify_resolution_images, analyze_image

app = Flask(__name__)
# Enable Cross-Origin requests from the React frontend running on localhost:5173
CORS(app)

@app.route('/analyze-issue', methods=['POST'])
def analyze_issue():
    data = request.json
    image = data.get('image')
    
    if not image:
        return jsonify({"error": "Missing image"}), 400
        
    result = analyze_image(image)
    return jsonify(result), 200

@app.route('/verify-resolution', methods=['POST'])
def verify_resolution():
    data = request.json
    before_image = data.get('beforeImage')
    after_image = data.get('afterImage')
    
    if not before_image or not after_image:
        return jsonify({"error": "Missing beforeImage or afterImage"}), 400
        
    # Execute detection + background matching
    result = verify_resolution_images(before_image, after_image)
    return jsonify(result), 200

if __name__ == '__main__':
    print("-" * 50)
    print("      CIVICPROOF ML SERVICE (YOLOv8)      ")
    print("-" * 50)
    print("🚀 API Endpoint: http://localhost:5000")
    print("📡 Targets: Pothole & Infrastructure Detection")
    print("-" * 50)
    # debug=False generally recommended when heavy TF models are loaded 
    # to avoid the Flask reloader duplicating the model in memory.
    app.run(host='0.0.0.0', port=5000, debug=False)
