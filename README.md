
# 🚨 Safety Alert Platform

> A community-driven safety reporting platform where residents can report neighborhood incidents (fire, accidents, vandalism, medical emergencies), enriched with AI-powered categorization and validation.

![Badge](https://img.shields.io/badge/version-0.8.0-blue.svg)
![Badge](https://img.shields.io/badge/license-MIT-green.svg)
![Badge](https://img.shields.io/badge/status-in_development-yellow.svg)

## 📘 Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Configuration](#configuration)  
- [Project Structure](#project-structure)  
- [API Documentation](#api-documentation)  
- [Current Progress](#current-progress)  
- [Roadmap](#roadmap)  
- [Screenshots](#screenshots)  
- [Contributing](#contributing)  
- [License](#license)  
- [References](#references)  
- [Acknowledgments](#acknowledgments)  

## 🔎 Overview

Safety Alert is a full-stack web platform that allows residents to **report safety incidents** in their locality with **text, images, or videos**.  
Admins and moderators can verify alerts, while AI models will later categorize severity and detect spam/false positives.

The platform ensures a safer neighborhood through **community reporting + AI intelligence**.

## ✨ Features

### ✅ Completed  
- **User authentication** (JWT + bcrypt)  
- **Registration & Login pages**  
- **Alert posting with media upload (image/video)**  
- **My Alerts page**  
- **Dashboard with navigation**  
- **Multer file upload configured**  
- **Alert model designed with AI fields**  

### 🔄 In Progress  
- Editable alert cards  
- Admin verification panel  
- Dashboard UI  
- Pagination + search + filtering  

### 🔮 Planned (Future)  
- AI categorization (severity & category auto-detection)  
- Duplicate/spam alert detection  
- Real-time map view  
- Push notifications  
- Community zones/ward-level dashboards  

## 🛠 Tech Stack

### **Frontend**
- React.js  
- React Router  
- TailwindCSS (planned)  
- Axios  

### **Backend**
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- Multer for media upload  
- JWT Authentication  
- bcrypt password hashing  

### **Dev Tools**
- Postman  
- VS Code  
- Git + GitHub  

## 🧩 Prerequisites

You should have the following installed:

- **Node.js** (v16+)  
- **npm**  
- **MongoDB Atlas or local MongoDB server**  
- **Git**  

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/safety-alert.git
cd safety-alert
```

Install backend dependencies:

```bash
cd backend
npm install
```

Run server:

```bash
npm start
```

## ⚙️ Configuration

Create a `.env` file inside `backend/`:

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret_key
PORT=5000
```

Ensure an **uploads/** folder exists:

```bash
mkdir uploads
```

## 📁 Project Structure

```
backend/
│── controllers/
│     ├── authController.js
│     ├── alertController.js
│
│── routes/
│     ├── authRoutes.js
│     ├── alertRoutes.js
│
│── models/
│     ├── User.js
│     ├── Alert.js
│
│── middleware/
│     ├── authMiddleware.js
│
│── uploads/            # Image/Video storage
│── server.js
│── package.json
│── .env
```

## 📡 API Documentation

### **Auth Routes**
| Method | Endpoint             | Description      |
|--------|----------------------|------------------|
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login user       |

### **Alert Routes**
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/alerts`         | Create alert (with media)|
| GET    | `/api/alerts/mine`    | Get user's alerts        |
| DELETE | `/api/alerts/:id`     | Delete an alert          |

## 📌 Current Progress

### ✔ Authentication System  
Working end-to-end with registration & login pages integrated.

### ✔ Alert Posting Module  
- Media upload using Multer  
- Stores images/videos in `/uploads`  
- Saves title, description, category, severity, AI fields  

### ✔ My Alerts Page  
- Shows user-specific alerts  
- Displays title, severity, description, location, media, timestamp  
- Delete option enabled  

### ✔ Dashboard Structure  
- Navigation to all pages  
- Ready to display alerts  

## 🗺 Roadmap

### **Phase 1 (Core Features)**  
- [x] Auth module  
- [x] Post alert with media  
- [x] My Alerts  
- [ ] Dashboard data feed  
- [ ] Edit alert  

### **Phase 2 (Admin + Controls)**  
- [ ] Verification panel  
- [ ] Alert moderation  
- [ ] Category filters & severity filters  

### **Phase 3 (AI Integration)**  
- [ ] Auto-categorization  
- [ ] Severity prediction  
- [ ] Spam / duplicate detection  

### **Phase 4 (Community Tools)**  
- [ ] Live Map  
- [ ] Real-time updates  
- [ ] Push notifications  

## 🖼 Screenshots

*(Add after frontend UI is completed)*

## 🤝 Contributing

Contributions are welcome!  
Feel free to open issues and submit pull requests.

## 📄 License

This project is licensed under the **MIT License**.

## 📚 References

- Express.js Docs  
- MongoDB Mongoose  
- Multer Uploads  
- JWT Authentication  
- REST API Best Practices  

## 🙏 Acknowledgments

- Inspired by community safety platforms  
- Thanks to everyone contributing to improving public safety  
- Special appreciation to open-source libraries that make development easier  

---

**Last Updated:** November 13, 2025  
**Version:** 0.8.0
