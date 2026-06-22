# GuardianAI — Security Review & Vulnerability Audit

This document conducts a technical security audit of **GuardianAI** (formerly **CivicProof**), identifying vulnerabilities and providing actionable remediation strategies.

---

## 1. Authentication Security

### Current Implementation
*   Users register or log in, generating a JSON Web Token (JWT) signed with a HS256 algorithm via `JWT_SECRET`.
*   Tokens are signed on the server with a **7-day expiry** (`expiresIn: "7d"`).
*   Tokens are stored client-side in the browser's `localStorage` and managed by React `AuthContext`.
*   Interceptors attach the token to all outgoing requests via the `Authorization: Bearer <token>` header.

### Vulnerability Analysis & Risks
1.  **Storage Vulnerability (XSS Exposure):** Storing JWTs in `localStorage` makes them accessible to any script running on the page. If the application is compromised by a Cross-Site Scripting (XSS) attack (e.g., via a malicious third-party dependency or unsanitized user-generated inputs), attackers can easily steal user tokens.
2.  **Long Token Lifespan:** A 7-day expiration window is too long for high-privilege operations. If a token is intercepted, the attacker has unrestricted access to the user's account for up to a week.
3.  **Lack of Token Revocation:** Since the authentication is stateless, the backend has no built-in way to invalidate active tokens before they expire.

### Recommended Fixes
*   **HttpOnly Cookies:** Store JWTs in secure, `HttpOnly` and `SameSite=Strict` cookies. This prevents JavaScript from accessing the token, blocking XSS-based theft.
*   **Short-lived Access Tokens + Refresh Tokens:** Reduce the JWT lifespan to 15 minutes and implement secure refresh tokens stored in database collections to allow selective revocation.

---

## 2. Authorization (RBAC) & Route Protection

### Current Implementation
*   **Role Hierarchy:** The database schema restricts user roles to one of `["CITIZEN", "WORKER", "AUTHORITY"]`.
*   **Server-Side RBAC Enforcement:**
    *   Protected backend routes use `authMiddleware.js` to extract the JWT payload and fetch the updated User document from the database on every single request.
    *   High-privilege actions (like resolving a ticket) check the user's role on the retrieved record before saving updates to Mongoose:
        ```javascript
        if (!["WORKER", "AUTHORITY"].includes(req.user.role)) {
          return res.status(403).json({ message: "Only staff can resolve alerts." });
        }
        ```
    *   Report deletions check ownership: `alert.userId.toString() !== req.user.id`.
*   **Frontend Guards:** Protects UI rendering using custom `<PrivateRoute>` and `<AdminRoute>` wrappers.

### Vulnerability Analysis & Risks
*   *Strengths:* Re-querying the database user record inside `authMiddleware.js` on every request prevents token replay attacks. If an administrator revokes a worker's account or changes their role in MongoDB Atlas, they lose access instantly, even if they hold a valid 7-day token.
*   *Weaknesses:* The alert modification route (`PUT /api/alerts/:id`) handles general updates (like modifying the description) alongside resolution uploads (attaching photos). There is a risk of a **Privilege Escalation** vector: a standard `CITIZEN` could try to bypass role checks by sending a payload that mimics standard description edits while including resolution fields.

### Recommended Fixes
*   Split the `/api/alerts/:id` modification endpoint into separate routes:
    *   `PATCH /api/alerts/:id` for standard incident updates (restricted to the report owner).
    *   `POST /api/alerts/:id/resolve` for resolution submissions (restricted to `WORKER` and `AUTHORITY` roles).

---

## 3. Input Validation & API Protection

### Current Implementation
*   File uploads are managed in-memory using `multer.memoryStorage()`.
*   Fields like latitude and longitude are converted to floats before saving: `parseFloat(latitude)`.

### Vulnerability Analysis & Risks
1.  **Arbitrary File Uploads (RCE Risks):** The backend configuration in [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L10) does not filter file types. It accepts arbitrary uploads via `upload.single("media")` without validation, sending the payload directly to Cloudinary.
    *   *Risk:* A malicious user could upload non-image executables, scripting languages, or abnormally large files, leading to denial-of-service (DoS) or execution risks.
2.  **NoSQL Injection (MongoDB):** The login query evaluates inputs directly: `User.findOne({ email })`. If parameters are passed as query objects rather than primitive strings, a malicious actor could bypass password checks.

### Recommended Fixes
*   **Enforce Multer File Filters:** Enforce strict file filters and size limits (e.g., maximum 10MB) directly inside your controller:
    ```javascript
    const fileFilter = (req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "video/mp4"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and MP4 allowed"), false);
      }
    };
    ```
*   **Sanitize Inputs:** Use libraries like `mongo-sanitize` to strip special query operators (such as `$gt` or `$ne`) from incoming request payloads.

---

## 4. GPS & EXIF Verification Tampering

### Current Implementation
*   GuardianAI uses `validateGPSData` (via the `exifr` library) to parse image metadata and check coordinates against the device's reported location.
*   Resolutions require workers to be within 500 meters of the alert site, calculated using the Haversine formula.

### Vulnerability Analysis & Risks
*   *EXIF Stripping:* As noted, compression from social apps strips EXIF metadata.
*   *EXIF Spoofing:* While difficult for casual users, EXIF coordinates are stored as text headers in the image file and can be easily modified using tools like `exiftool` before uploading, bypassing the distance check.

### Remediation
*   Use `exifr`'s distance checks as an *assistive signal* rather than a absolute pass/fail credential.
*   Rely on the worker's real-time browser GPS location captured at the moment of submission as the primary proof of proximity.
*   Combine proximity checks with the ML service's visual background alignment matching (ORB) to ensure the photos actually match.

---

## 5. Summary of OWASP Vulnerability Matrix

| OWASP Category | Specific Risk in GuardianAI | Remediation Steps |
|---|---|---|
| **A01:2021-Broken Access Control** | Standard users attempting to bypass role gates on multi-purpose `PUT /api/alerts/:id` endpoints. | Split general updates and resolutions into dedicated endpoints with explicit role-based route guards. |
| **A03:2021-Injection** | Malicious input payloads manipulating Mongo ODM queries. | Sanitize incoming strings and strictly cast IDs to MongoDB ObjectIds before queries. |
| **A04:2021-Insecure Design** | Long access token lifetimes stored in insecure `localStorage`. | Migrate to HttpOnly cookies and implement short-lived tokens with secure refresh tokens. |
| **A05:2021-Security Misconfiguration** | Unrestricted file uploads allowing arbitrary file types. | Enforce Multer MIME-type filters and strict file size boundaries. |
