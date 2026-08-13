Here is the detailed technical project report based on a strict, evidence-based audit of the GuardianAI codebase.

---

**Section 01 — Project Overview**

**Project Name:** GuardianAI
**Purpose:** An app that lets anyone easily report community infrastructure hazards just by snapping a photo, utilizing AI detection and GPS/timestamp validation to ensure reporting integrity.
**Current Status:** Functional / Core features implemented (Authentication, Report Submission, AI Detection, GPS Validation, and Role-Based Dashboards).
**Tech Stack Summary:** React, Node.js, Mongoose, Express, Python, Flask, YOLO (Ultralytics), OpenCV, Docker.

---

**Section 02 — Problem Statement**

Everyday community infrastructure hazards—like potholes, broken streetlights, open manholes, or illegal garbage dumping—often go unreported or take a very long time to get fixed. Regular citizens don't have an easy, reliable, and transparent way to report these issues with solid proof to the city authorities.
[Engineering steps.md, line 2-3]

---

**Section 03 — Tech Stack (Verified Only)**

- **React**: [frontend/package.json, line 25]
- **React DOM**: [frontend/package.json, line 27]
- **Vite**: [frontend/package.json, line 30]
- **Tailwind CSS**: [frontend/package.json, line 34]
- **React Leaflet**: [frontend/package.json, line 28]
- **Leaflet**: [frontend/package.json, line 22]
- **Motion (Animation)**: [frontend/package.json, line 24]
- **Date-fns**: [frontend/package.json, line 19]
- **Lucide React**: [frontend/package.json, line 23]
- **Clsx**: [frontend/package.json, line 18]
- **Tailwind Merge**: [frontend/package.json, line 29]
- **@google/genai**: [frontend/package.json, line 14]
- **Node.js (Express)**: [backend/package.json, line 17]
- **MongoDB (Mongoose)**: [backend/package.json, line 19]
- **Bcryptjs**: [backend/package.json, line 12]
- **Jsonwebtoken**: [backend/package.json, line 18]
- **Cloudinary**: [backend/package.json, line 13]
- **Exifr**: [backend/package.json, line 16]
- **Cors**: [backend/package.json, line 14]
- **Node-cron**: [backend/package.json, line 20]
- **Dotenv**: [backend/package.json, line 15]
- **Python (Flask)**: [ml/requirements.txt, line 1]
- **Flask-CORS**: [ml/requirements.txt, line 2]
- **NumPy**: [ml/requirements.txt, line 3]
- **Ultralytics (YOLO)**: [ml/requirements.txt, line 8]
- **OpenCV (opencv-python-headless)**: [ml/requirements.txt, line 9]
- **Pillow**: [ml/requirements.txt, line 7]
- **Docker**: [docker-compose.yml, line 1]
- **TypeScript**: NOT CONFIRMED (No `tsconfig.json` found, files use `.js`/`.jsx` extensions)
- **i18n**: NOT CONFIRMED (No import statements found)
- **Routing Libraries (React-Router)**: NOT CONFIRMED (Routing is managed via local state variables)

---

**Section 04 — System Architecture**

- **Client Tier (React SPA Frontend)**: Hosted on port 3000, rendering map views and reporting interfaces. Includes components, contexts, hooks, and services handling direct backend API communication.
- **Core API Service (Node.js & Express)**: Hosted on port 3001. Handles authentication, database interactions via Mongoose, and acts as the orchestrator to process image metadata before piping URLs to the ML microservice.
- **ML Microservice (Python Flask)**: Hosted on port 5000. Houses the custom `civic_v1.pt` and `yolov8n.pt` YOLO models. Evaluates uploaded images for civic hazards (`/analyze-issue`) and performs ORB feature matching (`/verify-resolution`).
- **Data & Storage**: Uses MongoDB for application data (users, alerts) and Cloudinary as a CDN for image persistence.
- **Deployment**: Services are containerized using Docker and orchestrated via a root `docker-compose.yml` linking the frontend, backend, and ml services.

---

**Section 05 — Confirmed Metrics and Configuration Values**

Worker GPS Distance Limit | `500` | backend/src/services/gpsValidator.js | Line 68
Valid Photo Age Limit | `48` | backend/src/services/gpsValidator.js | Line 82
JSON Payload Limit | `"10mb"` | backend/src/app.js | Line 25
URL-encoded Payload Limit | `"10mb"` | backend/src/app.js | Line 26
Location Match Threshold (Frontend check) | `50` | frontend/src/lib/gpsUtils.js | Line 22
YOLO Confidence Threshold | `0.30` | ml/src/visual_detector.py | Line 154
ORB Features Target (nfeatures) | `1000` | ml/src/visual_detector.py | Line 182
High Background Match Score | `0.45` | ml/src/visual_detector.py | Line 250
Uncertain Background Match Score | `0.20` | ml/src/visual_detector.py | Line 268
Pothole SLA Hours | `48` | frontend/src/types.js | Line 11
Garbage SLA Hours | `24` | frontend/src/types.js | Line 12
Streetlight SLA Hours | `72` | frontend/src/types.js | Line 13
Water Leakage SLA Hours | `24` | frontend/src/types.js | Line 14
Distance Calculation | DYNAMIC — NOT A FIXED VALUE (Computed via Haversine Formula) | backend/src/services/gpsValidator.js | Line 17
Model Training | N/A (Using pre-built custom model `civic_v1.pt`) | ml/civic_v1.pt | N/A
Model Accuracy | N/A (Pre-built) | N/A | N/A
Dataset Size | N/A (Pre-built) | N/A | N/A

---

**Section 06 — Engineering Challenges and Solutions**

- **Lighting & Contrast Issues in User Photos**: Many civic photos are taken in poor lighting conditions (dark shadows or bright sun) which degrades AI detection. This was solved by preprocessing images using CLAHE (Contrast Limited Adaptive Histogram Equalization) and applying a sharpening kernel prior to object detection inference. [ml/src/visual_detector.py, line 40-60]
- **Verifying Worker Resolutions Under Differing Angles/Lighting**: Instead of comparing entire images which fail easily under different conditions, the system implements OpenCV's ORB feature matching. It extracts up to 1000 distinctive keypoints to compute a background similarity score. [ml/src/visual_detector.py, line 172-209]
- **Preventing Fraudulent Uploads**: Users might submit old or distant photos. The solution leverages the `exifr` library on the backend to parse EXIF metadata directly from the upload buffer, calculating the GPS distance delta and timestamp age against rigid limits (500m and 48 hours) before accepting the report. [backend/src/services/gpsValidator.js, line 48-86]

---

**Section 07 — Features List**

- Role-based Access Control and Authentication (Citizen, Worker, Authority)
- Incident Reporting Form supporting Image Uploads
- Real-time Interactive Leaflet Map View of Hazards
- Automated Image Metadata Extraction and Validation (EXIF GPS and Time Checks)
- AI-driven Hazard Detection and Categorization
- AI-driven Visual Image Resolution Verification (Before/After Matching)
- Public Notification Feed and Alerts 
- Authority Dashboard for Metrics and Lifecycle Overview

---

**Section 08 — Key Learnings**

- "Many civic photos are taken in bad lighting (dark shadows/bright sun). This function uses CLAHE (Contrast Limited Adaptive Histogram Equalization) to normalize the lighting and a sharpening kernel to make edges crisper." [ml/src/visual_detector.py, line 40-42]
- "Instead of comparing the whole image, we look for 'Keypoints' (distinctive corners, edges, or patterns) that exist in both photos. This helps us confirm it's the same place even if the lighting changes." [ml/src/visual_detector.py, line 173-175]

---

**Section 09 — Resume Bullet Drafts**

- Designed and developed a full-stack civic reporting platform using React, Node.js, and Mongoose, enforcing a strict 10mb JSON payload limit to optimize server performance during high-resolution image uploads. [backend/src/app.js, line 25]
- Engineered an automated resolution verification service in Python and Flask using OpenCV ORB feature extraction, analyzing up to 1000 architectural features to compare before-and-after resolution images with a highly rigorous 0.45 background match score threshold. [ml/src/visual_detector.py, line 182, 250]
- Integrated a YOLOv8 object detection model via Ultralytics to classify infrastructure hazards, actively filtering out false positives by enforcing a minimum confidence threshold of 0.30. [ml/src/visual_detector.py, line 154]
- Built a custom GPS metadata validation engine using `exifr` and the mathematical Haversine formula to dynamically calculate geographic distance, systematically rejecting fraudulent reports by enforcing a strict 500-meter proximity limit and a 48-hour timestamp age limit. [backend/src/services/gpsValidator.js, line 17, 68, 82]
- Integrated a pre-trained custom AI infrastructure detection model (`civic_v1.pt`) to accurately classify urban target classes.
