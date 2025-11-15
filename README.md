# GuardianAI
A community-driven safety alert platform that allows residents to report incidents in real-time with images/videos, while providing admins and AI systems tools to verify, prioritize, and analyze alerts.

---

## Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Configuration](#configuration)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [API Documentation](#api-documentation)  
- [Database Schema](#database-schema)  
- [Environment Variables](#environment-variables)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Overview
**GuardianAI** is a full-stack web platform designed to make communities safer by enabling residents to report incidents quickly and reliably. Users can submit alerts with images or videos, track their own reports, and browse community-wide alerts through an interactive dashboard.  
This project is built using the **MERN stack (MongoDB, Express, React, Node.js)** and will soon incorporate AI capabilities such as auto-categorization, severity prediction, and spam detection.

### Purpose
- Provide a centralized platform for local safety incident reporting.  
- Enable real-time visibility of community incidents.  
- Allow authorities/admins to verify, classify, and respond to alerts.  
- Prepare system for future AI-based threat assessment.

### Target Users
- Local residents  
- Community moderators  
- Municipal authorities  
- Emergency response teams  

### Key Objectives
- Fast and simple alert submission  
- Secure user authentication  
- Transparent community dashboard  
- Media upload support (images/videos)  
- AI-enhanced alert classification *(coming soon)*  

---

## Features
- User authentication (signup/login/logout)  
- Alert creation with media upload (Multer)  
- Private "My Alerts" dashboard  
- Alert details view  
- Secure JWT-based protected routes  
- Interactive map integration (Leaflet)  
- Role-based access (admin routes planned)  
- Admin verification dashboard *(coming)*  
- AI severity/category estimation *(coming)*  
- Live real-time feed *(coming)*  
- Multiple language support *(planned)*  
- Push notifications *(planned)*  

---

## Tech Stack
### Frontend
- React.js  
- React Router  
- Tailwind CSS *(incoming)*  
- Axios  
- Leaflet (maps)  

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT Authentication  
- Multer (file uploads)  
- bcrypt (password hashing)  
- dotenv  

### DevOps & Deployment
- GitHub  
- MongoDB Atlas  
- **Deployment options:**  
  - Frontend → Vercel / Netlify  
  - Backend → Render / Railway  

### Additional Tools
- Postman  
- ESLint + Prettier *(optional)*  
- npm scripts  

---

## Prerequisites
Install the following:
- Node.js v16+  
- npm or yarn  
- Git  
- MongoDB / MongoDB Atlas  
- VS Code *(recommended)*  

Verify installation:

node --version
npm --version
git --version


---

## Installation

### 1. Clone the Repository

git clone https://github.com/sakalesha/GuardianAI.git
cd GuardianAI


### 2. Install Backend Dependencies

cd backend
npm install


### 3. Install Frontend Dependencies

cd ../frontend
npm install


---

## Configuration

### Backend
In `backend/`, create a `.env` file:

cp .env.example .env

Then update values as per your setup.

### Frontend
In `frontend/`, create a `.env`:

REACT_APP_API_URL=http://localhost:5000/api


---

## Usage

### Start Backend

cd backend
npm run dev

Runs on: [http://localhost:5000](http://localhost:5000)

### Start Frontend

cd frontend
npm start

Runs on: [http://localhost:3000](http://localhost:3000)

Access the app in your browser:  
[http://localhost:3000](http://localhost:3000)

---

## Project Structure

GuardianAI/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── uploads/ # Multer media storage
│ ├── server.js
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── services/
│ │ ├── App.js
│ │ └── index.js
│ └── package.json
│
├── README.md
└── .gitignore


---

## API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | User login |
| GET  | /auth/me | Get logged-in user |

### Alert Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /alerts | Create a new alert with media |
| GET | /alerts/mine | Get alerts submitted by logged user |
| GET | /alerts/:id | Get alert details |
| DELETE | /alerts/:id | Delete alert |

---

## Database Schema

### User Model

User
├── _id (ObjectId)
├── name (String)
├── email (String, unique)
├── password (String, hashed)
├── role (String: user/admin)
├── createdAt
└── updatedAt


### Alert Model

Alert
├── _id (ObjectId)
├── title (String)
├── description (String)
├── mediaUrl (String)
├── location (String / GPS)
├── severity (String) # planned
├── aiCategory (String) # future
├── aiSeverity (String) # future
├── aiConfidence (Number) # future
├── user (ObjectId -> User)
├── createdAt
└── updatedAt


---

## Environment Variables

### Backend `.env`

PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret


### Frontend `.env`

REACT_APP_API_URL=http://localhost:5000/api


---

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo  
2. Add `REACT_APP_API_URL` in environment variables  
3. Deploy with one click  

### Backend (Render)
1. Create new Web Service  
2. Set environment variables  
3. Deploy  

### Database (MongoDB Atlas)
1. Create a cluster  
2. Add IP whitelist  
3. Generate connection string  

---

## Contributing
1. Fork the repo  
2. Create feature branch:  

git checkout -b feature/my-feature

3. Commit changes  
4. Push and create Pull Request  

---

## License
This project is licensed under the **MIT License**.

---

## Contact
**Author:** Ronada Sakalesha  
**Email:** [ronadasakalesha@gmail.com](mailto:ronadasakalesha@gmail.com)  
**GitHub:** [https://github.com/sakalesha](https://github.com/sakalesha)  

For support or queries:  
📩 Contact via email or open a GitHub issue.

---

### Optional Add-ons
If you’d like, these can also be generated for your repo:
- 📘 `API_DOCS.md`
- 🧩 ER Diagram (PNG/SVG)
- 💾 Postman Collection
- 🖼️ Custom GitHub Banner Image
