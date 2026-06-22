# GuardianAI — Deployment & Operations Guide

This guide describes how to configure, run locally, build, and deploy the entire **GuardianAI** (formerly **CivicProof**) multi-service application.

---

## 1. Environment Variables

Both the REST API gateway and ML service must be configured using separate `.env` files.

### A. Express API Backend (`backend/.env`)
Create a file at `backend/.env` and supply the following variables:

```bash
# Server Network Configuration
PORT=5050                       # Express server listen port

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/guardianai?retryWrites=true&w=majority

# Security Keys
JWT_SECRET=9465f297941dc483ec5399452bef2206dc48bd35cbb1f1d79cd13e4b1c1a8556  # Strong random string

# Cloudinary Integrations (Media storage)
CLOUDINARY_CLOUD_NAME=dc490ytyl
CLOUDINARY_API_KEY=363865835919985
CLOUDINARY_API_SECRET=T_ZA-j3CaUaPLwlDKpPxBZrBQS8

# Machine Learning Service Integration
ML_API_URL=http://localhost:5000 # Location of the Flask API
```

### B. React Frontend (`frontend/.env` or direct configuration)
By default, the React client uses hardcoded API gateways matching production or development.
*   The primary server gateway matches `https://guardianai-crp4.onrender.com`.
*   To redirect local development, update [axiosInstance.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/frontend/src/utils/axiosInstance.js#L7):
    ```javascript
    baseURL: "http://localhost:5050/api"  // Switch to port 5050 for local dev
    ```

---

## 2. Local Setup & Execution Instructions

### Step 1: Clone and Set Up Root Node Concurrent Run
From the root repository folder, install concurrent run tools to start both web systems together:
```powershell
npm install
```

### Step 2: Configure & Start Express Backend
Navigate to `/backend`, install Node packages, and run the server (which uses `nodemon` for auto-refreshing during dev):
```powershell
cd backend
npm install
npm start
```
*Expected log output:*
```
Connected to MongoDB...
Server running on port 5050
```

### Step 3: Configure & Start Flask ML Microservice
Ensure you have **Python 3.8+** installed. Navigate to the `/ml` directory, establish a virtual environment to manage packages, install requirements, and execute the startup script:

```powershell
cd ml
# 1. Establish Virtual Environment
python -m venv venv
# 2. Activate Virtual Environment (Windows)
.\venv\Scripts\activate
# 3. Install packages
pip install -r requirements.txt
# 4. Start ML server
python ml_api.py
```
*Expected log output:*
```
--------------------------------------------------
      CIVICPROOF ML SERVICE (YOLOv8)      
--------------------------------------------------
🚀 API Endpoint: http://localhost:5000
📡 Targets: Pothole & Infrastructure Detection
--------------------------------------------------
Loading CUSTOM Civic Model: ...\ml\civic_v1.pt
Model Classes: {0: 'pothole', 1: 'garbage', ...}
AI Model loaded successfully.
* Running on all addresses (0.0.0.0:5000)
```

### Step 4: Configure & Start React Frontend
In a new terminal window, navigate to the `/frontend` directory, install react-scripts packages, and run:
```powershell
cd frontend
npm install
npm start
```
*Expected action:* Launches a new browser page pointing to `http://localhost:3000`.

---

## 3. Docker Configurations

To package and run the ecosystem in a sandbox environment without manual steps, a `docker-compose.yml` config is located inside `/civicproof`:

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    ports:
      - "5050:5050"
    environment:
      - PORT=5050
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - ML_API_URL=http://ml:5000
    depends_on:
      - ml

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend.Dockerfile
    ports:
      - "3000:3000"

  ml:
    build:
      context: ./ml
      dockerfile: ../docker/ml.Dockerfile
    ports:
      - "5000:5000"
```

### Running Docker Compose
In the directory containing `docker-compose.yml`, run the build command to boot up all three services:
```bash
docker-compose up --build
```

---

## 4. Cloud Deployments

GuardianAI is pre-configured to build on public cloud environments. Here is the operational setup for a production release:

### A. Express API Gateway (e.g., Render)
1.  Connect your GitHub repository to Render (`https://render.com`).
2.  Create a new **Web Service**.
3.  Specify the **Root Directory** as `backend`.
4.  Configure the environment settings:
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js` *(Note: nodemon is only for development; use standard node for production execution).*
5.  Populate all secrets inside the **Environment Variables** panel matching your `backend/.env` file.

### B. React Frontend Client (e.g., Vercel, Netlify, or Render Static Sites)
1.  Create a **Static Site** pointing to the GitHub repo.
2.  Set the **Root Directory** to `frontend`.
3.  Configure:
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `build`
4.  Deploy. Netlify/Vercel will distribute the static bundle globally.

### C. Flask ML Microservice (e.g., Render or AWS EC2)
Due to YOLOv8 requiring OpenCV libraries and pre-trained weights (`civic_v1.pt`), the ML container has high CPU and RAM requirements:
1.  Deploy a virtual server instance (e.g., **AWS EC2 t3.medium** or a Render Web Service).
2.  If deploying via standard Git, make sure `g++` and library bindings for headless OpenCV (`libgl1-mesa-glx`, `libglib2.0-0`) are available on the host system. If deploying on Render, use a custom Docker container to manage system dependencies:
    ```dockerfile
    FROM python:3.9-slim
    RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    CMD ["python", "ml_api.py"]
    ```

---

## 5. Monitoring & Maintenance

### Logging Locations
*   **Local Backend logs:** Streamed directly to standard output `stdout`.
*   **Production Render logs:** Accessible in the **Logs** tab of individual service dashboards.
*   **MongoDB Atlas Database Monitoring:** The database provides charts for connection limits, CPU usage, and slow-running operations inside the **Database/Metrics** Atlas section.

### SLA & Date Configurations
Every created Alert has an auto-computed `slaDeadline` set to 72 hours.
*   To modify the default SLA resolution window, adjust the time delta in [alertController.js](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB%20+%20ML/GuardianAI/backend/controllers/alertController.js#L102):
    ```javascript
    slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000) // Adjust multiplier
    ```

### Rollback Process
1.  **Code Rollbacks:** Revert commits on your Git repository's production branch (`main`/`master`). CI/CD pipelines will automatically rebuild and roll back.
2.  **Database Rollbacks:** Atlas takes regular snapshot backups. Navigate to the Atlas backup console and select a snapshot time to roll back user records or database states.
