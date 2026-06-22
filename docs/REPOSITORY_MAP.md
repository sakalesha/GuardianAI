# GuardianAI — Repository Map & File Inventory

This document maps all directories and primary files of the **GuardianAI** (formerly **CivicProof**) workspace, detailing their purposes, key functions, and dependencies.

---

## 1. Project Directory Structure

```
GuardianAI/                         # Root Workspace
├── backend/                        # Node.js Express REST API
│   ├── config/                     # Core system configurations
│   ├── controllers/                # REST endpoints business logic
│   ├── middleware/                 # Request interceptors and role gates
│   ├── models/                     # MongoDB document schema definitions
│   ├── routes/                     # REST endpoint routers
│   ├── scripts/                    # Database maintenance scripts
│   ├── services/                   # Internal business services
│   ├── uploads/                    # Legacy local file storage
│   ├── .env                        # Environment configurations (ignored)
│   ├── inspect_db.js               # DB testing utility script
│   ├── migrate_roles.js            # DB user role migration script
│   ├── patch_user.js               # DB user timestamp patching script
│   ├── server.js                   # Application startup entry point
│   └── package.json                # Server package specifications
│
├── frontend/                       # React SPA Client
│   ├── public/                     # Static configurations and index.html
│   ├── src/                        # React source code
│   │   ├── components/             # Reusable UI widgets & protective routes
│   │   ├── context/                # Global React contexts
│   │   ├── pages/                  # Views / Layout pages
│   │   ├── utils/                  # HTTP interceptors and clients
│   │   ├── App.js                  # React router setup and page layouts
│   │   ├── index.js                # Global frontend bootstrap
│   │   └── index.css               # Modern CSS stylesheet
│   └── package.json                # Client package specifications
│
└── ml/                             # Python Machine Learning Service
    ├── src/                        # ML image processing engines
    │   └── visual_detector.py      # YOLOv8 & OpenCV ORB core algorithms
    ├── ml_api.py                   # Flask server entry point
    ├── civic_v1.pt                 # Pre-trained civic YOLOv8 weights (22.5 MB)
    ├── yolov8n.pt                  # Fallback general YOLOv8 weights (6.5 MB)
    └── requirements.txt            # Python dependencies list
```

---

## 2. Express Backend File Inventory

### [server.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/server.js)
*   **Purpose:** The entry point of the REST API backend.
*   **Responsibilities:** Boots the Express engine, mounts global middlewares (CORS, body parser), serves static folders, sets up MongoDB via Mongoose, and starts the listener.
*   **Dependencies:** `express`, `mongoose`, `cors`, `dotenv`

### [models/User.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/models/User.js)
*   **Purpose:** Defines the Mongoose database schema for User documents.
*   **Responsibilities:** Enforces email uniqueness, role enum restrictions (`CITIZEN`, `WORKER`, `AUTHORITY`), and timestamp generations.
*   **Dependencies:** `mongoose`

### [models/Alert.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/models/Alert.js)
*   **Purpose:** Defines the Mongoose database schema for Alert documents.
*   **Responsibilities:** Represents comprehensive alert properties, including geolocation coordinates, media links, ML categories/confidence ratings, EXIF verification results, resolution evidence, SLA deadlines, and history audit array subdocuments.
*   **Dependencies:** `mongoose`

### [controllers/authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/authController.js)
*   **Purpose:** Manages authentication endpoints.
*   **Responsibilities:** Implements registration, checks email conflicts, hashes passwords using bcrypt, assigns roles, logs users in, and signs JWT tokens.
*   **Key Functions:**
    *   `register(req, res)`: Creates new User profiles.
    *   `login(req, res)`: Authenticates credentials and returns JWT.
*   **Dependencies:** `User.js`, `bcryptjs`, `jsonwebtoken`

### [controllers/alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js)
*   **Purpose:** Orchestrates safety alerts CRUD operations and handles verification gates.
*   **Responsibilities:** 
    *   Manages Multer multipart files and uploads image buffers to Cloudinary as Base64 strings.
    *   Initiates EXIF validations via `gpsValidator.js`.
    *   Calls the Flask ML microservice `/analyze-issue` to auto-triage category and severity.
    *   Protects report resolution via dual GPS/Visual gates (calling Flask `/verify-resolution` and checking distance).
    *   Updates the `history` audit log at every state transition.
*   **Key Functions:**
    *   `createAlert(req, res)`: Handles new report submissions, runs EXIF parsing, calls YOLOv8, and sets initial status.
    *   `getAlerts(req, res)`: Returns list of all alerts sorted newest first.
    *   `getAlertById(req, res)`: Returns a single alert.
    *   `getMyAlerts(req, res)`: Returns alerts submitted by the logged-in user.
    *   `updateAlert(req, res)`: Modifies alert details or processes resolution submissions (enforcing role, GPS, and ORB gates).
    *   `deleteAlert(req, res)`: Removes reports after verifying owner.
*   **Dependencies:** `Alert.js`, `cloudinary.js`, `gpsValidator.js`, `multer`

### [middleware/authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js)
*   **Purpose:** Enforces token verification on routes.
*   **Responsibilities:** Extracts the Bearer token from headers, verifies its signature using `JWT_SECRET`, and queries the database for the active User document (excluding passwords) to assign it to `req.user`.
*   **Dependencies:** `jsonwebtoken`, `User.js`

### [services/gpsValidator.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/services/gpsValidator.js)
*   **Purpose:** Performs image EXIF extraction and geospatial calculations.
*   **Responsibilities:** Parses metadata from binary buffers using `exifr` and uses the Haversine formula to compute distance between points in meters.
*   **Key Functions:**
    *   `calculateDistanceMeters(lat1, lon1, lat2, lon2)`: Computes Haversine distance.
    *   `validateGPSData(base64Image, deviceLat, deviceLon)`: Reads EXIF data, checks distance mismatch (500m limit), and validates photo freshness (< 48 hours).
*   **Dependencies:** `exifr`

### [config/cloudinary.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/config/cloudinary.js)
*   **Purpose:** Configures Cloudinary media storage.
*   **Responsibilities:** Initializes Cloudinary SDK credentials using environment variables.
*   **Dependencies:** `cloudinary`

---

## 3. Python ML Microservice File Inventory

### [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/ml_api.py)
*   **Purpose:** The entry point of the Python machine learning service.
*   **Responsibilities:** Starts a Flask server, enables CORS, and defines two REST routes (`/analyze-issue` and `/verify-resolution`) that connect to the core visual detector functions.
*   **Dependencies:** `flask`, `flask-cors`, `visual_detector.py`

### [src/visual_detector.py](file:///c:/Users/ronad/OneDrive/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py)
*   **Purpose:** The core computer vision processing engine.
*   **Responsibilities:** Loads YOLOv8 weights, enhances photos, maps detections to civic categories, and executes ORB feature-matching background comparisons.
*   **Key Functions:**
    *   `enhance_image_for_ai(image)`: Applies CLAHE color-space normalization to the Y channel (luminance) and applies a sharpening edge filter.
    *   `map_to_civic_category(class_name)`: Maps custom classes (`pothole`, `garbage`) or general YOLO classes to civic labels.
    *   `load_image_from_any_source(source_string)`: Downloads images from Cloudinary URLs or decodes Base64 data.
    *   `perform_object_detection(image)`: Processes images and runs YOLOv8. Discards detections with confidence < 0.30.
    *   `calculate_background_similarity(image_one, image_two)`: Detects up to 1,000 ORB keypoints and uses Brute-Force Matcher to verify background alignment.
    *   `analyze_image(img_source)`: Triages single uploaded images.
    *   `verify_resolution_images(before_source, after_source)`: Compares before/after images and returns scores (`VERIFIED_RESOLUTION`, `NEEDS_HUMAN_REVIEW`, `SUSPICIOUS_DIFFERENT_LOCATION`).
*   **Dependencies:** `ultralytics`, `cv2` (OpenCV), `numpy`, `urllib`, `PIL`

---

## 4. React Frontend File Inventory

### [index.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/index.js)
*   **Purpose:** Frontend entry point bootstrap.
*   **Responsibilities:** Renders the parent `<App />` component wrapped inside `<AuthProvider>` for global state management.
*   **Dependencies:** `react`, `react-dom`, `AuthContext.jsx`

### [App.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/App.js)
*   **Purpose:** App router and layout definitions.
*   **Responsibilities:** Governs route paths (`/`, `/login`, `/register`, `/my-alerts`, `/alerts/:id`, `/create-alert`, `/alerts/edit/:id`), wraps pages with the persistent navigation layout, and enforces route guards.
*   **Dependencies:** `react-router-dom`, `PrivateRoute.jsx`, `AdminRoute.jsx`, `Layout.jsx`

### [utils/axiosInstance.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/utils/axiosInstance.js)
*   **Purpose:** Custom Axios client with request and response interceptors.
*   **Responsibilities:** 
    *   Request Interceptor: Automatically attaches the user's JWT bearer token to the `Authorization` header of all requests. It also decodes the token client-side using `jwt-decode` to verify expiration before hitting the network.
    *   Response Interceptor: Monitors responses. If the server returns a `401 Unauthorized` error, it automatically logs the user out and redirects them to `/login`.
*   **Dependencies:** `axios`, `jwt-decode`

### [pages/Dashboard.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/Dashboard.jsx)
*   **Purpose:** Main application view.
*   **Responsibilities:** Renders the Leaflet map (Pins, Clusters, and Heatmap modes), displays high-level statistics in a live feed sidebar, and manages search filters and sort queries using `useMemo`.
*   **Dependencies:** `react-leaflet`, `leaflet`, `react-leaflet-cluster`

### [pages/CreateAlert.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/CreateAlert.jsx)
*   **Purpose:** Incident reporting form page.
*   **Responsibilities:** Detects device coordinates via `navigator.geolocation` on mount, runs reverse geocoding to fill the address, processes address autocomplete queries via OpenStreetMap's Nominatim search, and uploads the incident details.
*   **Dependencies:** `axiosInstance.js`, `react-hot-toast`, `react-icons`

### [pages/AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx)
*   **Purpose:** Incident detailed view page.
*   **Responsibilities:** Renders complete report parameters (category, coordinates, original evidence vs resolution evidence), shows the chronological audit log timeline, enables citizens to delete their own reports, and allows staff to capture GPS coordinates and upload resolutions.
*   **Dependencies:** `axiosInstance.js`, `react-icons`
