# GuardianAI — Troubleshooting Guide & Runbook

This guide covers common issues, their root causes, and practical resolutions encountered during the development and operation of **GuardianAI** (formerly **CivicProof**).

---

## 1. Core Development Struggles & Fixes

Here are verified engineering issues documented during development and their structural fixes:

### Issue 1: TypeScript Checking Errors in Pure JavaScript Files
*   **Symptom:** IDEs or build servers throw errors such as: `"Argument of type 'string | undefined' is not assignable to parameter"` in plain `.js` files.
*   **Root Cause:** Hidden configurations inside a `jsconfig.json` file in frontend or backend directories with `"checkJs": true` enabled. This configuration forces the TypeScript language service to validate environment variables and parameters.
*   **Resolution:** Delete any `jsconfig.json` files in your workspace and remove strict type-masquerading JSDoc tags (`@param`, `@type`) to return fully to standard JavaScript syntax.

---

### Issue 2: Mongoose User Pre-save Hook Crashes (`next is not a function`)
*   **Symptom:** User registration requests crash the server with a `TypeError: next is not a function` error inside the User schema pre-save hook.
*   **Root Cause:** In modern versions of Mongoose (Mongoose 9+), if a pre-save hook is defined as an `async` function, Mongoose **does not pass** a `next` callback parameter. Calling `next()` inside the async hook causes the server to crash.
*   **Resolution:** When using `async` pre-save hooks, remove the `next` parameter from the function signature and rely on `async/await` promise resolutions:
    ```javascript
    // INSTEAD OF:
    UserSchema.pre("save", async function (next) { ... next(); });

    // USE THIS:
    UserSchema.pre("save", async function () { 
      // async logic here
      return; 
    });
    ```
    *Note: In the active repository, password hashing has been simplified by moving it directly into the controllers layer inside `authController.js`.*

---

### Issue 3: YOLOv8 Fails to Detect Potholes (`DEBUG: Found 0`)
*   **Symptom:** Pre-trained pothole models are running successfully but returning zero detected issues, even on high-confidence sample images.
*   **Root Cause:** Many pre-trained weights from Hugging Face or Roboflow output numeric labels (e.g., class `0`, `1`) instead of mapped strings like `'pothole'` or `'garbage'`. If the mapping code only checks for strings, it will miss these numeric classes.
*   **Resolution:** Update your mapping filter to check for both strings and numeric indices:
    ```python
    # visual_detector.py
    if class_name in ['pothole', 'potholes', '0', 0]:
        return "ROAD_DAMAGE_DETECTED"
    ```

---

## 2. GPS & Image Verification Failures

### Issue 4: "No EXIF(GPS) Data Found" Flagged on Valid Submissions
*   **Symptom:** Citizens reporting hazards receive warnings or have their alerts marked as suspicious because EXIF parsing fails, even though they took the photo with a smartphone.
*   **Root Cause:** Compression algorithms used by screenshots, messaging apps (e.g., WhatsApp, Telegram), or custom camera apps strip EXIF metadata (specifically GPS coordinates and capture timestamps) to reduce file sizes or protect privacy.
*   **Resolution:** Ensure your backend logs these failures in `verificationData` instead of strictly blocking the citizen submission. Let citizens submit without EXIF data by using their browser's active GPS as a backup, while documenting the missing EXIF coordinates in the audit log.

---

### Issue 5: ORB Feature Matching Triggers False Rejections (`SUSPICIOUS_DIFFERENT_LOCATION`)
*   **Symptom:** Workers resolving an issue submit a valid resolution photograph at the site, but the system rejects the fix, claiming the backgrounds do not match.
*   **Root Cause:** ORB feature matching compares spatial landmarks (corners, street lines, wall boundaries). If a worker photographs a resolved issue from a significantly different angle, distance, or lighting condition than the original citizen photo, the keypoint match score will drop below the 0.20 threshold.
*   **Resolution:** 
    1.  Instruct workers to photograph resolutions from a similar perspective as the original photo.
    2.  For highly ambiguous cases, administrators can review before/after photos side-by-side on the details page (`/alerts/:id`) and override rejections.
    3.  If false rejections are too frequent, adjust the ORB score thresholds in [visual_detector.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/ml/src/visual_detector.py#L251) downwards (e.g., from 0.20 to 0.15).

---

## 3. Operational & Connectivity Issues

### Issue 6: Express Gateway Fails to Reach Python ML Service
*   **Symptom:** Backend logs show errors such as `Failed to reach Python ML Service` or request timeouts during alert creation/resolution.
*   **Root Cause:** The Flask service on Port 5000 is stopped, crashing, or blocked by a firewall.
*   **Resolution:**
    1.  Ensure the Flask server is running: `python ml_api.py`.
    2.  Confirm the ML microservice URL matches in your backend `.env` file: `ML_API_URL=http://localhost:5000`.
    3.  Verify network reachability by running a curl command:
        ```bash
        curl -X POST http://localhost:5000/analyze-issue -H "Content-Type: application/json" -d "{\"image\":\"some_url\"}"
        ```
    4.  *Graceful Degradation:* The Express backend includes `try/catch` wrappers. If the Flask microservice is down, the system will save the alert, defaulting status to `PENDING` rather than crashing the request.

---

## 4. Useful Debugging Commands & Scripts

GuardianAI includes helper scripts in the `/backend` folder to inspect and clean up data:

### 1. Database Inspection Script (`inspect_db.js`)
Use this script to review database records for specific test users and their submitted alerts:
```powershell
node backend/inspect_db.js
```
*Purpose:* Confirms connection settings and outputs JSON representations of user documents and their corresponding alerts.

### 2. Role Migration Script (`migrate_roles.js`)
If you have legacy user records with older roles (e.g., `'resident'` or `'admin'`), execute this script to standardize them to the new roles (`'CITIZEN'`, `'WORKER'`, `'AUTHORITY'`):
```powershell
node backend/migrate_roles.js
```

### 3. User Date Patching Script (`patch_user.js`)
For older user records that are missing auto-generated timestamp fields, run this script to supply default registration dates:
```powershell
node backend/patch_user.js
```

### 4. Alert Coordinates Patching (`scripts/fixAlerts.js`)
Run this script to manually patch coordinate values on specific mock MongoDB Alert IDs:
```powershell
node backend/scripts/fixAlerts.js
```
