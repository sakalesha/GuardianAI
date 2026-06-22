# GuardianAI — API Reference

This document provides technical specifications for all REST endpoints exposed by the **GuardianAI** (formerly **CivicProof**) Express API gateway and Python Flask ML microservice.

---

## 1. Authentication Endpoints

### Register User
*   **Route:** `/api/auth/register`
*   **Method:** `POST`
*   **Description:** Creates a new user account, hashes credentials using bcrypt, and issues a 7-day JWT.
*   **Authentication:** None (Public)
*   **Request Body (JSON):**
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123",
      "location": "Bengaluru, India",
      "role": "CITIZEN" 
    }
    ```
    *Note: `role` must be one of `CITIZEN`, `WORKER`, or `AUTHORITY`. Defaults to `CITIZEN` if omitted or invalid.*
*   **Response Structure (200 OK):**
    ```json
    {
      "message": "User registered successfully",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "_id": "6915d5ccb8623838c7f82912",
        "name": "John Doe",
        "email": "john@example.com",
        "location": "Bengaluru, India",
        "role": "CITIZEN",
        "createdAt": "2026-06-02T08:00:00.000Z",
        "updatedAt": "2026-06-02T08:00:00.000Z"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: `{ "message": "All fields are required" }` or `{ "message": "User already exists" }`
    *   `500 Internal Server Error`: `{ "message": "error details" }`
*   **Source File:** [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/authController.js#L5)

---

### Login User
*   **Route:** `/api/auth/login`
*   **Method:** `POST`
*   **Description:** Authenticates user credentials and returns a secure JWT bearer token.
*   **Authentication:** None (Public)
*   **Request Body (JSON):**
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response Structure (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "_id": "6915d5ccb8623838c7f82912",
        "name": "John Doe",
        "email": "john@example.com",
        "location": "Bengaluru, India",
        "role": "CITIZEN"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: `{ "message": "Email and password are required" }` or `{ "message": "User not found" }` or `{ "message": "Invalid credentials" }`
    *   `500 Internal Server Error`: `{ "message": "error details" }`
*   **Source File:** [authController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/authController.js#L34)

---

## 2. Alert Management Endpoints

### Create Alert
*   **Route:** `/api/alerts`
*   **Method:** `POST`
*   **Description:** Creates a new safety alert with device coordinates and an optional image attachment. If an image is uploaded, it runs in-memory buffers to Cloudinary, executes EXIF metadata distance checks, and triggers real-time YOLOv8 issue triaging.
*   **Authentication:** Requires valid JWT (Bearer token in `Authorization` header)
*   **Request Format:** `multipart/form-data`
*   **Request Body (Form Fields):**
    *   `title` (string, required): Title of the incident
    *   `description` (string, required): Detailed description
    *   `location` (string, required): Address string
    *   `latitude` (number/string, required): Device GPS latitude
    *   `longitude` (number/string, required): Device GPS longitude
    *   `media` (file, optional): PNG, JPG image file
*   **Response Structure (200 OK):**
    ```json
    {
      "message": "Alert created successfully",
      "alert": {
        "_id": "6915d600b8623838c7f8291b",
        "userId": "6915d5ccb8623838c7f82912",
        "title": "Broken Streetlight",
        "description": "The lamp has been completely shattered and hangs by wires.",
        "location": "80 Feet Rd, Koramangala, Bengaluru",
        "latitude": 12.917658,
        "longitude": 77.623123,
        "category": "STREETLIGHT_REPAIR_NEEDED",
        "severity": "Medium",
        "aiConfidence": 0.82,
        "mediaUrl": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/guardianai/alerts/img.jpg",
        "mlMetadata": {
          "detectedIssues": [
            {
              "label": "STREETLIGHT_REPAIR_NEEDED",
              "confidence": 0.82,
              "box": [10.2, 50.4, 25.1, 75.3]
            }
          ],
          "hasValidIssue": true
        },
        "verificationData": {
          "isValid": true,
          "distanceMeters": 12,
          "timeDifferenceHours": 0.15,
          "reason": "Valid EXIF(GPS) Data"
        },
        "status": "PENDING",
        "slaDeadline": "2026-06-05T08:00:00.000Z",
        "history": [
          {
            "status": "PENDING",
            "timestamp": "2026-06-02T08:00:00.000Z",
            "user": "Citizen",
            "message": "Alert filed. AI detected: STREETLIGHT_REPAIR_NEEDED."
          }
        ],
        "createdAt": "2026-06-02T08:00:00.000Z",
        "updatedAt": "2026-06-02T08:00:00.000Z"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: `{ "message": "All fields are required" }`
    *   `401 Unauthorized`: `{ "message": "No token provided" }` or `{ "message": "Invalid or expired token" }`
    *   `500 Internal Server Error`: `{ "message": "error details" }`
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L15)

---

### Get All Alerts
*   **Route:** `/api/alerts`
*   **Method:** `GET`
*   **Description:** Returns all incidents in the database sorted in reverse chronological order (newest first).
*   **Authentication:** Requires valid JWT (Bearer token in `Authorization` header)
*   **Response Structure (200 OK):**
    ```json
    [
      {
        "_id": "6915d600b8623838c7f8291b",
        "title": "Broken Streetlight",
        "location": "80 Feet Rd, Koramangala, Bengaluru",
        "latitude": 12.917658,
        "longitude": 77.623123,
        "category": "STREETLIGHT_REPAIR_NEEDED",
        "severity": "Medium",
        "status": "PENDING",
        "mediaUrl": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/...",
        "createdAt": "2026-06-02T08:00:00.000Z"
      }
    ]
    ```
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L126)

---

### Get My Alerts
*   **Route:** `/api/alerts/mine`
*   **Method:** `GET`
*   **Description:** Returns a list of alerts submitted specifically by the currently authenticated user.
*   **Authentication:** Requires valid JWT (Bearer token in `Authorization` header)
*   **Response Structure (200 OK):** Mapped array of Alert documents matching the token's user ID.
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L151)

---

### Get Alert By ID
*   **Route:** `/api/alerts/:id`
*   **Method:** `GET`
*   **Description:** Fetches detailed information for a single safety alert using its unique Mongo ObjectId.
*   **Authentication:** Requires valid JWT
*   **Response Structure (200 OK):** Complete Alert document object including subdocuments and history array.
*   **Error Responses:**
    *   `404 Not Found`: `{ "message": "Alert not found" }`
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L138)

---

### Update Alert / Submit Resolution
*   **Route:** `/api/alerts/:id`
*   **Method:** `PUT`
*   **Description:** Updates core fields of an alert. 
    *   *Citizen Use:* Modifies `title`, `description`, `location`, `severity`, or updates initial media.
    *   *Worker/Authority Use:* Resolves the alert by attaching a resolution image along with device-reported coordinates (`resolutionLatitude` and `resolutionLongitude`). This triggers the GPS proximity gate and Flask ORB verification pipeline.
*   **Authentication:** Requires valid JWT. Staff role required to submit resolution.
*   **Request Format:** `multipart/form-data`
*   **Request Body (Form Fields):**
    *   `title` / `description` / `location` / `severity` (strings, optional)
    *   `media` (file, optional): Resolution verification image
    *   `resolutionLatitude` (number, required if uploading resolution media)
    *   `resolutionLongitude` (number, required if uploading resolution media)
*   **Response Structure (200 OK - Successful Resolution):**
    ```json
    {
      "message": "Alert updated successfully",
      "alert": {
        "_id": "6915d600b8623838c7f8291b",
        "status": "RESOLVED",
        "resolutionImageUrl": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/guardianai/resolutions/repaired.jpg",
        "verificationScore": 0.58,
        "verificationLabel": "VERIFIED_RESOLUTION",
        "history": [
          "...",
          {
            "status": "RESOLVED",
            "timestamp": "2026-06-02T10:00:00.000Z",
            "user": "Authority Officer",
            "message": "Resolution submitted. Awaiting ML verification."
          },
          {
            "status": "RESOLVED",
            "timestamp": "2026-06-02T10:00:05.000Z",
            "user": "System_ML_Auditor",
            "message": "Auto-Verified: High background match (0.58). The issue is gone."
          }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden`: `{ "message": "Only staff can resolve alerts." }` (Returned if user role is `CITIZEN` but resolution fields are provided)
    *   `406 Not Acceptable`: `{ "error": "Resolution Rejected", "message": "Worker is too far from the site: 620m (Limit: 500m)" }` (Proximity gate failure)
    *   `404 Not Found`: `{ "message": "Alert not found" }`
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L184)

---

### Delete Alert
*   **Route:** `/api/alerts/:id`
*   **Method:** `DELETE`
*   **Description:** Deletes a specific report document from MongoDB.
*   **Authentication:** Requires valid JWT. Enforces check: `alert.userId === req.user.id`.
*   **Response Structure (200 OK):**
    ```json
    {
      "message": "Alert deleted successfully"
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden`: `{ "message": "Not authorized" }` (User trying to delete another resident's report)
    *   `404 Not Found`: `{ "message": "Alert not found" }`
*   **Source File:** [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L165)

---

## 3. Python Flask ML Endpoints

These microservice endpoints are invoked internally by the Express gateway:

### Analyze Image
*   **Route:** `/analyze-issue`
*   **Method:** `POST`
*   **Description:** Performs image lighting enhancements and filters detections based on YOLOv8 weights (`civic_v1.pt`).
*   **Authentication:** None (Internal Microservice boundary)
*   **Request Body (JSON):**
    ```json
    {
      "image": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/guardianai/alerts/img.jpg"
    }
    ```
*   **Response Structure (200 OK):**
    ```json
    {
      "success": true,
      "has_issue": true,
      "detections": [
        {
          "label": "ROAD_DAMAGE_DETECTED",
          "original_object": "pothole",
          "confidence": 0.778,
          "box": [124.5, 340.2, 280.1, 450.6]
        }
      ]
    }
    ```
*   **Source File:** [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/ml_api.py#L14)

---

### Verify Resolution
*   **Route:** `/verify-resolution`
*   **Method:** `POST`
*   **Description:** Compares before/after visual metrics to confirm location matching and evaluate if the hazard has been fixed.
*   **Authentication:** None (Internal Microservice boundary)
*   **Request Body (JSON):**
    ```json
    {
      "beforeImage": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/guardianai/alerts/before.jpg",
      "afterImage": "https://res.cloudinary.com/dc490ytyl/image/upload/v1234/guardianai/resolutions/after.jpg"
    }
    ```
*   **Response Structure (200 OK):**
    ```json
    {
      "score": 0.583,
      "label": "VERIFIED_RESOLUTION",
      "reasoning": "High background match (0.58). The issue is gone.",
      "before_detections": [
        {
          "label": "ROAD_DAMAGE_DETECTED",
          "confidence": 0.78,
          "box": [124.5, 340.2, 280.1, 450.6]
        }
      ],
      "after_detections": []
    }
    ```
*   **Source File:** [ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/ml_api.py#L25)
