# GuardianAI — Feature Inventory

This document maps all primary features of the **GuardianAI** (formerly **CivicProof**) ecosystem.

---

## 1. User Authentication & Authorization (RBAC)

### Purpose
Implements secure user onboarding and authentication. It handles credential validation and grants access levels according to three specific user roles: `CITIZEN` (residents), `WORKER` (maintenance crews), and `AUTHORITY` (municipal officers).

### User Workflow
1.  **Register:** An unauthenticated visitor navigates to `/register`, fills in their name, email, password, general location, selects a desired role, and submits. The system creates the account, hashes their password, and logs them in automatically.
2.  **Login:** Users navigate to `/login`, enter their email and password, and receive a secure token.
3.  **Role Enforcement:** Based on the role, the frontend dynamically updates UI views (e.g., hiding or displaying the "Resolve" button on details cards).

### Technical Specifications
*   **Entry Point (Frontend):** `frontend/src/pages/Login.jsx` & `frontend/src/pages/Register.jsx`
*   **Entry Point (Backend):** `backend/routes/authRoutes.js`
*   **Related Source Files:**
    *   [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/authController.js) (Registration and login controllers)
    *   [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) (Server-side endpoint protection)
    *   [AuthContext.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/context/AuthContext.jsx) (Global state manager)
    *   [PrivateRoute.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/components/PrivateRoute.jsx) (Gated route container)
    *   [AdminRoute.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/components/AdminRoute.jsx) (Authority-only route container)
*   **APIs Involved:** `POST /api/auth/register`, `POST /api/auth/login`
*   **Database Collections:** `users` (User Schema)
*   **Dependencies:** `bcryptjs` (hashing, 10 rounds), `jsonwebtoken` (signing, 7d expiry), `jwt-decode` (frontend decoding)
*   **Known Limitations:** Tokens are stored in browser `localStorage`, making them vulnerable to Cross-Site Scripting (XSS) if malicious scripts are injected. Recommended upgrade: migrate to HttpOnly cookies.

#### Phase 1: Client/User Interaction
The user enters credentials on the `/login` or `/register` form implemented in [Login.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/Login.jsx) or [Register.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/Register.jsx). Submission triggers an asynchronous `fetch` call sending a POST request to `https://guardianai-crp4.onrender.com/api/auth/login` or `https://guardianai-crp4.onrender.com/api/auth/register` with JSON body `{ email, password }` or `{ name, email, password, confirmPassword, location, role }`.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The backend gateway in [server.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/server.js) forwards the requests to `backend/routes/authRoutes.js`. The payload is intercepted by Express JSON parser middleware. In the controller [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/authController.js), field validation ensures required inputs are present (e.g. `!name || !email || !password || !location`), sending a `400 Bad Request` status if missing.

#### Phase 3: Middleware Logic & Performance Optimizations
No server-side caching or rate-limiting is implemented for authentication endpoints. For authenticated endpoints, [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) extracts the Bearer token, verifies it against the `JWT_SECRET`, queries MongoDB to retrieve the user's role/details using `.select("-password")` to optimize payload sizes, and attaches the user object to `req.user`.

#### Phase 4: Business Logic & Processing Engine
For registration, `bcryptjs` is used to hash the password with `10` salt rounds before inserting it. The controller handles role sanitization, mapping the input to `CITIZEN` by default if it's not a valid role. A JWT is then signed using `jsonwebtoken` with standard HS256 algorithm and `7d` expiration, containing the user ID and role in the payload.

#### Phase 5: Error Isolation & Fallback Strategies
Database connection errors or query failures throw an exception that is caught in the controller's `try-catch` block, which logs the error and returns a generic `500 Internal Server Error` message. If passwords do not match or a duplicate email is registered, the server returns a `400 Bad Request` containing the specific error details.

#### Phase 6: Persistence & State Update
Upon successful registration or login, the database writes or reads from the `users` collection using [User.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/models/User.js). The server returns a `200 OK` status with a JSON body containing `token`, `user` object, and a success message. The client saves these to `localStorage` and updates the React global state via [AuthContext.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/context/AuthContext.jsx), triggering a redirect to `/admin/dashboard` or `/user/dashboard`.

#### Core Interview Highlights (Ready to Discuss)
* **JWT Storage Security:** Storing tokens in `localStorage` leaves the application vulnerable to XSS. A better production strategy is storing JWTs in `HttpOnly` and `SameSite` cookies. Additionally, passwords are hashed using 10 rounds of `bcryptjs` on the CPU-intensive thread pool, isolating cryptographic overhead.

---

## 2. Interactive Geospatial Dashboard

### Purpose
Provides residents, field workers, and administrators with unified geospatial awareness of local hazards. It shows hazards on a Leaflet map and lists active reports in a searchable sidebar.

### User Workflow
1.  A user opens the platform and is greeted by the dashboard (`/`).
2.  **Map Mode Selection:** They can switch between three visualization modes:
    *   **Pins:** Shows individual incidents as standard map markers with click-to-popup details.
    *   **Clusters:** Groups adjacent pins together to simplify reading dense neighborhoods.
    *   **Heatmap:** Highlights safety hazard density using heat gradients based on report severity.
3.  **Live Sidebar:** Users can search reports by name or location and sort them by date (newest/oldest) with in-memory pagination (8 items per page).

### Technical Specifications
*   **Entry Point (Frontend):** `frontend/src/pages/Dashboard.jsx`
*   **Entry Point (Backend):** `backend/routes/alertRoutes.js` (GET route)
*   **Related Source Files:**
    *   [Dashboard.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/Dashboard.jsx) (Houses the Leaflet configurations, filters, page states, and map renders)
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (`getAlerts` logic)
*   **APIs Involved:** `GET /api/alerts`
*   **Database Collections:** `alerts`
*   **Dependencies:** `leaflet`, `react-leaflet`, `leaflet.heat`, `react-leaflet-cluster`
*   **Known Limitations:** Alerts are fetched in a single massive array payload. If the database expands to thousands of reports, client-side pagination and rendering will become slow. Recommended upgrade: implement server-side geospatial queries (`$nearSphere`) and page cursors.

#### Phase 1: Client/User Interaction
On loading `/`, the [Dashboard.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/Dashboard.jsx) page triggers a `fetch` request inside a `useEffect` hook to retrieve all incidents. User searches and sort preferences are captured using standard HTML inputs, updating local state (`search`, `sort`, `mapMode`, `page`) which triggers immediate client-side re-renders.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The gateway routing in [server.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/server.js) maps the route to `GET /api/alerts` in [alertRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/routes/alertRoutes.js). The request must pass through [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) to verify the Bearer token, which returns a `401 Unauthorized` if the token is missing or expired.

#### Phase 3: Middleware Logic & Performance Optimizations
No server-side caching, pagination, or query filtering is performed. The client-side dashboard performs in-memory search filtering (filtering alerts matching query within `title`, `location`, or `category`) and manual pagination using `useMemo` hooks to minimize expensive recalculations on map re-renders.

#### Phase 4: Business Logic & Processing Engine
The core database query is executed inside the `getAlerts` method of [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js). It performs a bulk read: `Alert.find().sort({ createdAt: -1 })`. No complex spatial routing or coordinate processing is handled on the backend for dashboard queries.

#### Phase 5: Error Isolation & Fallback Strategies
If the database connection is lost, or if the server crashes during retrieval, the catch block intercepts the error and responds with `500` status and the error message. On the client, this sets the `error` state, rendering an error alert box while hiding map markers and presenting an empty state.

#### Phase 6: Persistence & State Update
There is no database write operation. The backend responds with `200 OK` and a JSON array of all alerts in the database. The frontend updates the `alerts` state, rendering them on the Leaflet map container using markers, marker clustering via `<MarkerClusterGroup>`, or a heatmap layer via `L.heatLayer`.

#### Core Interview Highlights (Ready to Discuss)
* **Client-Side Scaling Bottleneck:** The endpoint `GET /api/alerts` pulls the entire database collection in a single query and forces the client to handle sorting, filtering, and page partitioning. If the dataset grows to thousands of records, Leaflet rendering will lag; migrating to MongoDB geospatial queries (`$nearSphere`) and server-side cursor pagination is critical.

---

## 3. Incident Reporting Pipeline

### Purpose
Enables community members to report local hazards with evidence-backed data, validating submissions against coordinate tampering.

### User Workflow
1.  The citizen navigates to `/create-alert`.
2.  **Auto-GPS Lock:** The browser prompts for location permission and locks the device coordinates. OpenStreetMap Nominatim reverse-geocodes these coordinates to pre-populate the address input.
3.  The citizen enters an incident Title, Description, uploads an image, and clicks Submit.
4.  **Security Gate:** The server parses the image binary. If GPS EXIF data is found, it ensures the photo was captured within 500 meters of the device's reported coordinates and is less than 48 hours old. If validations fail, an explanation is saved to `verificationData` on the report.

### Technical Specifications
*   **Entry Point (Frontend):** `frontend/src/pages/CreateAlert.jsx`
*   **Entry Point (Backend):** `backend/routes/alertRoutes.js` (POST route)
*   **Related Source Files:**
    *   [CreateAlert.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/CreateAlert.jsx) (Geolocation, OSM Suggestion logic, Form fields)
    *   [gpsValidator.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/services/gpsValidator.js) (Haversine calculations and exifr parsing)
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (`createAlert` controller)
*   **APIs Involved:** `POST /api/alerts`, `https://nominatim.openstreetmap.org/reverse`, `https://nominatim.openstreetmap.org/search`
*   **Database Collections:** `alerts`
*   **Dependencies:** `exifr` (metadata parsing), `multer` (memory buffers), `cloudinary` SDK
*   **Known Limitations:** Message attachments and modern phone screenshots often strip EXIF metadata during compression. To keep the app usable, the pipeline notes EXIF absence in `verificationData` instead of strictly rejecting the submission.

#### Phase 1: Client/User Interaction
The user opens [CreateAlert.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/CreateAlert.jsx). On mount, the component requests geolocation access via `navigator.geolocation.getCurrentPosition()`. Address text queries or reverse lookup requests are sent to Nominatim OpenStreetMap API. The user enters form data and uploads an image, then submits the multi-part form.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The gateway routing forwards `POST /api/alerts` to [alertRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/routes/alertRoutes.js). The request passes [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) to confirm ownership, followed by Multer middleware configured for memory storage (`multer.memoryStorage()`) to extract file buffers.

#### Phase 3: Middleware Logic & Performance Optimizations
Files are processed directly in-memory using Multer's buffer streams. The image file buffer is converted to a Base64 data URI format on-the-fly (`const dataUri = data:${req.file.mimetype};base64,...`) and streamed to Cloudinary, avoiding disk writes on the server instance.

#### Phase 4: Business Logic & Processing Engine
The backend calls `validateGPSData` from [gpsValidator.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/services/gpsValidator.js). The image is parsed using `exifr.parse()`. If EXIF GPS coordinates exist, the distance to the device GPS coordinates is calculated using the Haversine formula, and the photo timestamp (`DateTimeOriginal`) is verified. The distance threshold is 500 meters and the age limit is 48 hours.

#### Phase 5: Error Isolation & Fallback Strategies
To prevent reporting failure due to missing metadata (since mobile screenshots often strip EXIF data), the pipeline writes the validation result or reason directly to `verificationData` inside the database rather than rejecting the alert creation. Network timeouts during image decoding are gracefully caught, reverting verification status to invalid with a logged reason.

#### Phase 6: Persistence & State Update
A new alert document is saved to the `alerts` collection in MongoDB with fields like `mediaUrl`, `verificationData`, `status: "PENDING"`, and an initial audit trail entry. The server returns a `200 OK` response with the alert details. The client React component triggers `toast.success` and redirects the user to `/my-alerts`.

#### Core Interview Highlights (Ready to Discuss)
* **Metadata Stripping Workaround:** Because modern messaging apps and screenshot utilities strip EXIF metadata, a strict rejection policy would break user experience. Saving EXIF validation details into a flexible `verificationData` schema instead of hard-rejecting ensures high system uptime while flags are audited during human review.

---

## 4. Automated AI Triage

### Purpose
Bypasses manual ticketing dispatchers by executing instant server-side object detection and category categorization on incoming hazard images.

### User Workflow
1.  When a citizen submits a report, the Express backend uploads the photo to Cloudinary.
2.  **ML Dispatch:** The Express backend calls the Flask ML service's `/analyze-issue` endpoint with the secure image URL.
3.  **Visual Preprocessing:** The Flask microservice adapts dark shadows/light contrast in the image using CLAHE and sharpens the edges.
4.  **Inference:** The YOLOv8 model runs over the image. Detections with confidence below 30% are discarded. High-confidence classes map to civic categories (e.g., `ROAD_DAMAGE_DETECTED`).
5.  **State Mapping:**
    *   If no civic issue is found, the report is saved with status `SUSPICIOUS_CONTENT`.
    *   If a civic issue is detected, the report status is set to `PENDING` and assigned the corresponding severity (e.g., Road Damage triggers "High" severity).

### Technical Specifications
*   **Entry Point (ML Service):** `ml/ml_api.py` (`/analyze-issue` endpoint)
*   **Related Source Files:**
    *   [visual_detector.py](file:///c:/Users/ronad/OneDrive/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py) (Inference engine, CLAHE, custom mappings)
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (Integrates the API call and maps severity)
*   **APIs Involved:** `POST /analyze-issue` (Port 5000 Flask)
*   **Database Collections:** `alerts` (saves `mlMetadata`, `category`, `severity`, `aiConfidence` fields)
*   **Dependencies:** `ultralytics` (YOLOv8 framework), `opencv-python-headless` (CLAHE, cv2.filter2D), `numpy`, `pillow`
*   **Known Limitations:** Under extreme occlusions or night lighting, object boundaries can blur, leading to false negatives.

#### Phase 1: Client/User Interaction
Triggered implicitly during report creation when the user submits their incident form on [CreateAlert.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/CreateAlert.jsx). The client has no direct control over ML triage operations.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The triage is executed internally inside `createAlert` in [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js). It issues a server-to-server POST request to the Flask API endpoint `/analyze-issue` (defaulting to `http://localhost:5000`) containing the JSON payload `{ image: uploadedImageUrl }`.

#### Phase 3: Middleware Logic & Performance Optimizations
The Flask service runs with `CORS` configuration and `debug=False` to prevent reloader memory overhead with heavy ML models. The YOLOv8 model (`civic_v1.pt` or fallback `yolov8n.pt`) is loaded globally during initialization inside [visual_detector.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py) to prevent loading weights on every request.

#### Phase 4: Business Logic & Processing Engine
The image is loaded into OpenCV BGR format. In [visual_detector.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py), the image is preprocessed using CLAHE (Contrast Limited Adaptive Histogram Equalization) on the lightness (Y) channel and sharpened. YOLOv8 runs inference, filtering detections below `0.30` confidence. Classes are mapped using `map_to_civic_category` to civic issues (e.g. `ROAD_DAMAGE_DETECTED`).

#### Phase 5: Error Isolation & Fallback Strategies
If the Flask ML service is offline or throws an exception, the Express controller catches the fetch exception, logs the event, and defaults the alert to `"PENDING"` status, category `"General"`, and severity `"Medium"` without crashing the response pipeline.

#### Phase 6: Persistence & State Update
If no civic issue is found, `status` is set to `"SUSPICIOUS_CONTENT"`. If issues are found, the alert category is updated to the high-confidence label and the severity is mapped accordingly (e.g., road damage to `High`). The alert is saved to MongoDB, and history logs the detected labels.

#### Core Interview Highlights (Ready to Discuss)
* **Decoupled Architecture Resilience:** Communicating with the Flask ML service over HTTP ensures that if the Python service crashes under high CPU workload, the core Node.js server remains fully operational and falls back to manual ticket processing, maintaining database writes.

---

## 5. Municipal Resolution Verification

### Purpose
Audits maintenance resolutions, forcing workers to physically visit locations and validating that the hazard was actually fixed.

### User Workflow
1.  A logged-in worker (`WORKER` or `AUTHORITY` role) opens an active report on the details page (`/alerts/:id`).
2.  They click the **Resolve** button, capture a photo of the repaired hazard, and submit it.
3.  **Proximity Audit:** The system locks their device GPS. The server runs a Haversine proximity check. If the worker is further than 500 meters from the original report coordinates, the resolution is rejected, and status is set to `REJECTED_GPS`.
4.  **Visual Audit:** If proximity passes, both before/after images are sent to the Flask ML service's `/verify-resolution` endpoint.
5.  ORB keypoint matching compares backgrounds.
    *   *Match Score > 0.45 + issue gone:* Status is updated to `RESOLVED`.
    *   *Match Score > 0.45 + issue remains:* Status is set to `NEEDS_HUMAN_REVIEW`.
    *   *Match Score <= 0.20:* Photos are flagged as having different backgrounds, setting status to `REJECTED_ML`.

### Technical Specifications
*   **Entry Point (ML Service):** `ml/ml_api.py` (`/verify-resolution` endpoint)
*   **Related Source Files:**
    *   [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx) (Resolution submission UI and geolocation capture)
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (Enforces the GPS check and routes Flask visual verification)
    *   [visual_detector.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py) (ORB matching and decision scoring)
*   **APIs Involved:** `POST /verify-resolution` (Flask), `PUT /api/alerts/:id` (Express)
*   **Database Collections:** `alerts` (Updates `resolutionImageUrl`, `verificationScore`, `verificationLabel`, and `status`)
*   **Dependencies:** `opencv-python-headless` (ORB feature detector and BFMatcher)
*   **Known Limitations:** ORB feature matching is highly sensitive to camera perspectives. If a worker photographs a repaired pothole from a 45-degree different angle than the original photo, the score can fall below thresholds, triggering false rejections or flagging a manual review.

#### Phase 1: Client/User Interaction
A worker clicks "Resolve" on [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx), uploads a photo of the repaired site, and clicks submit. The browser grabs the user's current GPS location and appends the file and coordinates to `FormData`, sending a `PUT` request to `/api/alerts/:id`.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The Express gateway intercepts the request at `PUT /api/alerts/:id` using `authMiddleware` and Multer. The controller [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) extracts the uploaded file and verifies that the logged-in user role is either `WORKER` or `AUTHORITY`.

#### Phase 3: Middleware Logic & Performance Optimizations
The resolution image is uploaded to Cloudinary folder `guardianai/resolutions`. The proximity check uses the Haversine formula to compute the distance. If it is greater than 500m, it instantly rejects, saving database writes and preventing downstream ML API requests.

#### Phase 4: Business Logic & Processing Engine
If proximity checks pass, the backend calls the Flask endpoint `/verify-resolution`. Inside [visual_detector.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py), the before/after images are processed. Background matching uses ORB feature matching (`BFMatcher` with `cv2.NORM_HAMMING`) and computes keypoint similarity. If the score is > 0.45 and no issues remain in the new image (verified by YOLOv8), it resolves the ticket.

#### Phase 5: Error Isolation & Fallback Strategies
If the Flask server is unreachable during resolution auditing, the system logs the failure and leaves the status unchanged. If background matching fails (score <= 0.20), it flags the submission as `REJECTED_ML`. If background matches but the issue is still present, it updates the status to `NEEDS_HUMAN_REVIEW`.

#### Phase 6: Persistence & State Update
The backend updates the alert document fields (`resolutionImageUrl`, `verificationScore`, `verificationLabel`, and `status`), pushing a status message to the `history` array, and saves to MongoDB. The client detail view re-fetches and updates the UI state.

#### Core Interview Highlights (Ready to Discuss)
* **ORB Matching Sensitivity:** ORB feature matching compares spatial descriptors and is sensitive to camera rotation and perspective changes. If a worker captures the repaired site from a 45-degree angle, background matching can fall below the `0.45` threshold. The system handles this by transitioning the status to `NEEDS_HUMAN_REVIEW` rather than failing, allowing manual overrides.

---

## 6. Audit Trail Logging

### Purpose
Maintains a tamper-proof history of report updates, detailing who took action, when, and the system verification details.

### User Workflow
1.  A user visits the incident details page (`/alerts/:id`).
2.  Beneath the description, they can view an interactive timeline of events:
    *   *Initial Filing:* AI classification results and timestamps.
    *   *Staff Actions:* Staff updates, coordinates, and resolution submissions.
    *   *Audit Logs:* Automated rejections or approvals by background gatekeepers (e.g., `System_Gatekeeper` or `System_ML_Auditor`).

### Technical Specifications
*   **Related Source Files:**
    *   [Alert.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/models/Alert.js) (Defines `history` array schema)
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (Pushes history log updates on create/update endpoints)
    *   [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx) (Renders the audit timeline UI)
*   **APIs Involved:** `GET /api/alerts/:id`
*   **Database Collections:** `alerts` (`history[]` subdocument array)
*   **Dependencies:** Standard Mongoose model array options.
*   **Known Limitations:** The history log array is modified on the server without cryptographic signing. It is not a blockchain ledger; a database administrator can still alter the array history manually in MongoDB.

#### Phase 1: Client/User Interaction
When a user views an incident details page `/alerts/:id` inside [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx), the component performs a GET request. The returned `history` array is mapped to render a timeline of status updates under the audit log.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
When alerts are created or updated, the requests hit Express API routers. The controller modifies the `history` array of the Alert model. Read access is protected by [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) to prevent unauthorized reading of internal log messages.

#### Phase 3: Middleware Logic & Performance Optimizations
No special caching layer is implemented for the logs. Logs are stored directly within the MongoDB parent document as a subdocument array to avoid multi-document joins during dashboard views, minimizing indexing overhead.

#### Phase 4: Business Logic & Processing Engine
The `history` field is defined as an Array in [Alert.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/models/Alert.js). When actions are processed, new objects containing `{ status, timestamp, user, message }` are pushed into the document's history array.

#### Phase 5: Error Isolation & Fallback Strategies
If history schema format validation fails, Mongoose throws a validation exception preventing the parent save operation, protecting state consistency. In the event of network or backend failures, the client detail view displays a fallback message without rendering the timeline.

#### Phase 6: Persistence & State Update
History updates are committed to the `alerts` collection in MongoDB alongside the parent alert document. The server returns the updated document, and the client detail UI updates the state to show the new timeline events.

#### Core Interview Highlights (Ready to Discuss)
* **No Cryptographic Logging Verification:** The history log array is modified directly on the MongoDB server and is not cryptographically signed. If database security is compromised, records can be retroactively altered; implementing a write-once hash chain or ledger logging would prevent tamper-vulnerabilities.

---

## 7. Self-Service Report Deletion

### Purpose
Allows citizens to manage and delete their own submitted reports, enforcing ownership checks to prevent unauthorized actions.

### User Workflow
1.  A logged-in citizen navigates to their personal reports page (`/my-alerts`) or selects a report they created.
2.  On the details screen, they click the **Delete** button.
3.  A modal confirmation asks for verification. Clicking confirm sends a request to the backend. The server ensures `alert.userId === req.user.id` before executing the deletion.

### Technical Specifications
*   **Entry Point (Frontend):** `frontend/src/pages/AlertDetails.jsx` (Delete modal)
*   **Entry Point (Backend):** `backend/routes/alertRoutes.js` (DELETE route)
*   **Related Source Files:**
    *   [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) (`deleteAlert` logic checking matching IDs)
    *   [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx) (Renders confirmation modals)
*   **APIs Involved:** `DELETE /api/alerts/:id`
*   **Database Collections:** `alerts`
*   **Dependencies:** Express routing gates.
*   **Known Limitations:** Deleting a report instantly deletes the document and historical evidence. There is no soft-delete recycle bin or database archiver configured.

#### Phase 1: Client/User Interaction
A logged-in creator of the alert clicks the delete button on [AlertDetails.jsx](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/pages/AlertDetails.jsx). After confirming via a modal, the client sends a `DELETE` request to `https://guardianai-crp4.onrender.com/api/alerts/:id` using Axios.

#### Phase 2: Gateway Entry & Authentication (or Routing & Validation)
The request is routed to `DELETE /api/alerts/:id` in [alertRoutes.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/routes/alertRoutes.js). [authMiddleware.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/middleware/authMiddleware.js) verifies the token and attaches the authenticated user to `req.user`.

#### Phase 3: Middleware Logic & Performance Optimizations
No pre-checks or performance proxies are configured for deletions. The check is performed synchronously at the controller database query layer.

#### Phase 4: Business Logic & Processing Engine
The controller `deleteAlert` in [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js) retrieves the alert from MongoDB. It verifies authorization by comparing the document creator's ID to the logged-in user's ID: `alert.userId.toString() !== req.user.id`. If they differ, it sends a `403 Forbidden` response.

#### Phase 5: Error Isolation & Fallback Strategies
If the alert is not found, it returns a `404 Not Found` response. If database errors occur during the deletion operation, they are caught in the catch block and returned as a `500` error, preventing client app state desynchronization.

#### Phase 6: Persistence & State Update
Upon authorization validation, the controller executes `alert.deleteOne()` to remove the document from the `alerts` collection. It returns a `200 OK` JSON response. The client UI triggers `toast.success` and routes the user back to the `/my-alerts` view.

#### Core Interview Highlights (Ready to Discuss)
* **Lack of Soft Deletes:** Deletion uses `deleteOne()` which instantly purges the incident and its historical audit log from the database. A safer design pattern for compliance and tracking is implementing a soft delete (e.g. setting an `isDeleted` flag) to support administrative recovery.
