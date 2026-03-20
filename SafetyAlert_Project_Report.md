# SafetyAlert – Community Safety Reporting Platform
### Project Report

**Author:** Ronada Sakalesha
**Contact:** ronadasakalesha@gmail.com | [github.com/sakalesha](https://github.com/sakalesha)
**Repository:** [github.com/sakalesha/SafetyAlert](https://github.com/sakalesha/SafetyAlert)
**Tech Stack:** MongoDB · Express.js · React.js · Node.js (MERN)
**Date:** March 2026

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [Methodology](#3-methodology)
4. [System Architecture](#4-system-architecture)
5. [Results & Implementation](#5-results--implementation)
6. [Challenges & Solutions](#6-challenges--solutions)
7. [Skills & Learnings](#7-skills--learnings)
8. [Conclusion & Future Work](#8-conclusion--future-work)
9. [Resume Summary](#9-resume-ready-summary)

---

## 1. Introduction

**SafetyAlert** is a full-stack, community-driven safety reporting web application that enables residents to document and share safety incidents in real time. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), the platform provides an intuitive interface for submitting incidents with supporting photos or videos, viewing them on an interactive map, and managing personal reports through a user dashboard.

The project was conceived from a real-world observation: safety incidents — ranging from accidents to infrastructure hazards — often go unreported or are communicated ineffectively through informal channels. SafetyAlert addresses this gap by providing a structured, evidence-backed, and publicly accessible reporting mechanism.

This report documents the design rationale, technical methodology, implementation results, and key learnings derived from the end-to-end development of SafetyAlert, from database schema design to a deployed full-stack web application.

---

## 2. Problem Statement & Objectives

### 2.1 Problem Statement
Many communities lack a centralized, reliable, and accessible platform for reporting safety incidents. Existing solutions are often:
- Siloed within municipal systems, inaccessible to ordinary residents.
- Lacking visual evidence support (photos/videos), reducing credibility.
- Slow to communicate incidents to the public.
- Not scalable for modern AI-assisted classification and prioritization.

### 2.2 Project Objectives
| # | Objective |
|---|-----------|
| 1 | Build a secure, full-stack web application for community safety reporting. |
| 2 | Implement JWT-based authentication to protect user data and actions. |
| 3 | Enable media uploads (photos and videos) as verifiable evidence. |
| 4 | Integrate an interactive map to visualize incident locations geographically. |
| 5 | Provide a personal dashboard for users to manage their submitted alerts. |
| 6 | Design a scalable REST API ready for future AI integrations. |
| 7 | Deploy the application on cloud infrastructure (Vercel + Render + MongoDB Atlas). |

---

## 3. Methodology

### 3.1 Development Approach
The project followed an **iterative, component-based development methodology**:

1. **Requirements Analysis** — Identified core user stories: register, login, create alert (with media and location), view map, manage personal alerts.
2. **Architecture Design** — Designed a decoupled client-server architecture with a RESTful API layer separating the React frontend from the Node.js backend.
3. **Backend-First Development** — Built and tested all API endpoints using Postman before connecting the frontend.
4. **Frontend Integration** — Developed React pages and components and integrated them with the live backend API using Axios.
5. **Testing & Debugging** — Manually tested all CRUD operations, authentication flows, and media upload pipelines.
6. **Deployment** — Deployed frontend on **Vercel**, backend on **Render**, and database on **MongoDB Atlas**.

### 3.2 Technology Stack

#### Backend
| Technology | Role |
|------------|------|
| **Node.js** | Server-side JavaScript runtime |
| **Express.js** | RESTful API framework and routing |
| **MongoDB + Mongoose** | NoSQL database with schema modeling |
| **Multer** | File upload middleware for photos/videos |
| **JSON Web Tokens (JWT)** | Stateless user authentication |
| **bcryptjs** | Secure password hashing |
| **dotenv** | Environment variable management |

#### Frontend
| Technology | Role |
|------------|------|
| **React.js** | Component-based UI library |
| **React Router** | Client-side navigation and routing |
| **Axios** | HTTP client for API communication |
| **Leaflet.js** | Interactive map rendering with geo-coordinates |
| **TailwindCSS** | Utility-first CSS styling framework |

#### Dev & Deployment Tools
| Tool | Purpose |
|------|---------|
| **GitHub** | Version control and collaboration |
| **Postman** | API testing and documentation |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Vercel** | Frontend deployment (CI/CD) |
| **Render** | Backend deployment |
| **VS Code** | Development environment |

### 3.3 Project Structure
```
SafetyAlert/
├── backend/
│   ├── controllers/       # Business logic (alertController, authController)
│   ├── routes/            # API route definitions (authRoutes, alertRoutes)
│   ├── models/            # Mongoose schemas (User, Alert)
│   ├── middleware/         # JWT auth middleware
│   ├── uploads/           # Locally stored media files
│   └── server.js          # App entry point
│
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── pages/         # Full page views (Dashboard, CreateAlert, MyAlerts, etc.)
        ├── context/       # Global state management (AuthContext)
        └── utils/         # Utility helpers
```

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                  CLIENT (React.js)               │
│  Pages: Dashboard │ CreateAlert │ MyAlerts       │
│         Login │ Register │ AlertDetails          │
│          ↕ Axios HTTP Requests                   │
└──────────────────────────────────────────────────┘
                         │
                  REST API (Express.js)
                         │
┌──────────────────────────────────────────────────┐
│               SERVER (Node.js)                   │
│  Routes: /api/auth  │  /api/alerts               │
│  Middleware: JWT Auth Guard                      │
│  Controllers: authController │ alertController   │
│  File Handling: Multer (disk storage)            │
└──────────────────────────────────────────────────┘
                         │
                  MongoDB (Mongoose)
                         │
┌──────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)            │
│  Collections: users │ alerts                     │
└──────────────────────────────────────────────────┘
```

### 4.2 Authentication Flow
1. User submits register/login credentials.
2. Server validates credentials; on success, hashes password with **bcrypt** and issues a **JWT** (7-day expiry).
3. Client stores the token and sends it in the `Authorization: Bearer <token>` header for all protected routes.
4. A custom **JWT middleware** verifies tokens on every protected API call before reaching controllers.

### 4.3 Media Upload Pipeline
1. Client submits a form with image/video files.
2. **Multer** middleware intercepts the `multipart/form-data` request and saves files to the `uploads/` directory with timestamped filenames.
3. The server stores the relative file path in the `Alert` document's `mediaUrl` field.
4. The backend serves the uploads directory as static files, allowing the frontend to render them directly.

---

## 5. Results & Implementation

### 5.1 Features Implemented

#### User Authentication
- **Secure Registration**: Users register with name, email, password (bcrypt-hashed), and location. Role defaults to `"resident"`.
- **JWT Login**: A signed JWT token is issued upon successful login, enabling stateless session management.
- **Protected Routes**: All alert creation, retrieval (personal), and deletion routes are guarded by JWT middleware.

#### Alert Management (CRUD)
- **Create Alert**: Users submit an incident with title, description, location string, GPS coordinates, and optional media (image/video). Each alert stores `userId` for ownership.
- **Get All Alerts**: A public endpoint returns all alerts sorted by newest first, powering the public dashboard feed.
- **Get My Alerts**: Authenticated users retrieve only their own alerts for the personal dashboard.
- **Get Alert by ID**: A single-alert detail view endpoint for drill-down display.
- **Update Alert**: Owners can update title, description, location, coordinates, category, severity, and media.
- **Delete Alert**: Owners can delete their alerts with ownership verification enforced at the API level.

#### Interactive Map
- **Leaflet.js** renders all alerts as pinned markers on a geographic map using `latitude` and `longitude` stored per alert.
- Clicking a marker surfaces the incident details inline.

#### Personal Dashboard
- A user-specific view (`/my-alerts`) lists all alerts the authenticated user has submitted with management options.
- Displays title, location, severity, category, date, and media preview per alert.

### 5.2 REST API Reference

**Base URL:** `http://localhost:5000/api`

#### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/auth/register` | Register a new resident user | ❌ |
| POST | `/auth/login` | Login and receive JWT | ❌ |
| GET | `/auth/me` | Fetch authenticated user profile | ✅ |

#### Alert Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/alerts` | Create a new alert (with media) | ✅ |
| GET | `/alerts` | Get all alerts (public feed) | ❌ |
| GET | `/alerts/mine` | Get authenticated user's alerts | ✅ |
| GET | `/alerts/:id` | Get details of a single alert | ❌ |
| PUT | `/alerts/:id` | Update an alert (owner only) | ✅ |
| DELETE | `/alerts/:id` | Delete an alert (owner only) | ✅ |

### 5.3 Database Schema

#### User Schema
```js
{
  name:     String  (required),
  email:    String  (required, unique),
  password: String  (required, bcrypt-hashed),
  location: String,
  role:     String  (enum: ["resident", "admin"], default: "resident")
}
```

#### Alert Schema
```js
{
  userId:      ObjectId  → ref: "User",
  title:       String    (required),
  description: String    (required),
  category:    String    (default: "General"),
  severity:    String    (default: "Medium"),
  latitude:    Number    (required),
  longitude:   Number    (required),
  location:    String,
  mediaUrl:    String,
  aiConfidence: Number   (default: 0.85),
  createdAt:   Date      (auto),
  updatedAt:   Date      (auto)
}
```
> Note: `aiConfidence`, `category`, and `severity` fields are architected to be populated by a planned AI classification module.

### 5.4 Frontend Pages
| Page | Route | Description |
|------|-------|-------------|
| **Register** | `/register` | New user sign-up form |
| **Login** | `/login` | User authentication form |
| **Dashboard** | `/` | Public map + all alerts feed |
| **CreateAlert** | `/create` | Alert submission form with media upload |
| **MyAlerts** | `/my-alerts` | Authenticated user's alerts with management |
| **AlertDetails** | `/alerts/:id` | Full detail view of a single alert |
| **EditAlert** | `/alerts/:id/edit` | Edit form for existing alert |

---

## 6. Challenges & Solutions

| Challenge | Solution Applied |
|-----------|-----------------|
| **Handling multipart form data** alongside JSON body for media uploads | Configured Multer to handle `multipart/form-data` and isolated JSON body parsing to non-upload routes. |
| **JWT stateless session management** across React routes | Implemented a React `AuthContext` using the Context API to persist and provide token/user state across all pages. |
| **Rendering geo-coordinates on a map** from user-submitted text location | Added explicit `latitude` and `longitude` fields to the Alert schema, captured via the browser's Geolocation API on the frontend. |
| **CORS issues** between React (port 3000) and Express (port 5000) | Added `cors()` middleware globally in Express and configured `REACT_APP_API_URL` in frontend `.env`. |
| **Authorization enforcement** (only owners can delete/update) | Backend validates `alert.userId.toString() === req.user.id` before any mutation operation. |
| **File path persistence** for uploaded media | Stored relative path (`/uploads/filename`) in MongoDB; served `uploads/` as static files via Express. |

---

## 7. Skills & Learnings

### 7.1 Technical Skills Developed

| Domain | Skills Gained |
|--------|--------------|
| **Full-Stack Development** | End-to-end MERN stack application design and development |
| **Backend Engineering** | RESTful API design, Express.js routing, middleware architecture |
| **Authentication & Security** | JWT stateless auth, bcrypt password hashing, role-based access control |
| **Database Design** | MongoDB schema modeling with Mongoose, relationships via ObjectId references |
| **File Handling** | Multipart form handling with Multer, static file serving |
| **Frontend Development** | React component architecture, hooks, React Router, Context API |
| **Geospatial Integration** | Interactive map rendering with Leaflet.js, GPS coordinate handling |
| **API Testing** | Endpoint testing and documentation with Postman |
| **Cloud Deployment** | Frontend on Vercel, backend on Render, database on MongoDB Atlas |
| **Version Control** | Git branching, commits, GitHub collaboration workflow |

### 7.2 Soft Skills Developed
- **System thinking** — Designed a coherent architecture that separates concerns across frontend, backend, and database layers.
- **Problem-solving** — Debugged complex cross-origin, file upload, and authentication issues independently.
- **Documentation** — Authored structured READMEs, API references, and deployment guides.
- **Scalability thinking** — Built data models and APIs with AI integration and admin features in mind for future iterations.

---

## 8. Conclusion & Future Work

### 8.1 Conclusion
SafetyAlert successfully demonstrates the capability to design, build, and deploy a real-world, production-ready full-stack web application from scratch. The platform provides a functional solution to community safety reporting, covering secure authentication, media evidence submission, geographic visualization, and personal alert management — all with a clean, modular codebase.

The project reflects a strong command of the MERN stack and modern web development best practices, including stateless authentication, RESTful API design, component-based UI development, and cloud deployment strategies. It also demonstrates an architectural readiness for AI integration, with fields like `aiCategory`, `aiSeverity`, and `aiConfidence` already baked into the data model.

### 8.2 Future Enhancements
| Feature | Description |
|---------|-------------|
| **AI Severity Classifier** | Integrate an ML model to auto-classify incident severity and category from title/description |
| **Admin Dashboard** | Role-based admin interface to verify, approve, or flag community alerts |
| **Real-time Notifications** | WebSocket-based push notifications for new alerts in the user's locality |
| **Search & Filters** | Filter alerts by category, severity, date range, and geographic area |
| **Social Proof** | Upvoting/confirming incidents by other residents to validate authenticity |
| **Mobile App** | React Native version for native mobile reporting with camera access |

---

## 9. Resume-Ready Summary

### One-Line Description
> Engineered a community safety reporting platform using the MERN stack with JWT authentication, Multer media uploads, and Leaflet.js geospatial mapping, deployed on Vercel and Render.

### Bullet Points (Resume Format)
- Built a full-stack MERN web application enabling residents to report safety incidents with photo/video evidence and GPS location, serving a RESTful API with 7 distinct endpoints across authentication and CRUD operations.
- Implemented stateless JWT authentication with bcrypt password hashing and role-based access control, securing all user-owned data mutations with server-side authorization checks.
- Integrated Leaflet.js interactive maps to visualize real-time incident locations using latitude/longitude coordinates captured via the browser Geolocation API.
- Designed a modular, scalable backend with Multer-based media upload pipeline, Mongoose schema modeling, and Express.js controller-route separation, with data model fields pre-provisioned for future AI classification.
- Deployed the application using Vercel (frontend), Render (backend), and MongoDB Atlas (cloud database), adhering to environment-variable–based configuration best practices.

### Resume Skills Tags
`React.js` · `Node.js` · `Express.js` · `MongoDB` · `Mongoose` · `REST API` · `JWT` · `bcryptjs` · `Multer` · `Leaflet.js` · `Axios` · `TailwindCSS` · `Postman` · `Git/GitHub` · `Vercel` · `Render` · `MongoDB Atlas` · `Context API` · `React Router`
