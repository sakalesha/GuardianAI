# 🚨 Safety Alert – Real-Time Community Incident Reporting System

**Tech Stack:** React.js · Node.js · Express.js · MongoDB · JWT · Multer · Leaflet Maps · TailwindCSS

A full-stack safety reporting platform that allows users to report incidents, upload images, view nearby alerts on an interactive map, and manage their own alerts. Fully authenticated, mobile-responsive, and deployed in production. [web:1][web:5]

## ⭐ Features

### 🔐 Authentication
- JWT-based login & registration
- Protected routes for authenticated users
- Persistent sessions using localStorage

### 🆘 Create Alerts
- Upload image evidence (Multer)
- Add location, severity, description
- Auto-store coordinates (lat/long)
- Real-time map updates

### ✏️ Edit / Delete Alerts
- Users can edit or delete only their own alerts
- Image replacement supported
- Backend authorization ensures security

### 🗺️ Interactive Map (Leaflet)
- Display all alerts as map markers
- Popup previews with summary info
- Click → navigate to full alert details

### 🔍 Dashboard Search + Filters
- Search by title, category, location
- Sort alerts (Newest / Oldest)
- Pagination for large datasets

### 🖼️ Media Handling
- Multer-based file upload
- Secure storage in /uploads directory
- Supports update & deletion

### 📱 Responsive UI
- TailwindCSS-styled
- Mobile-optimized layout
- Smooth, modern card design

### 🔔 User Feedback
- Toast notifications for all actions
- Loading states across all screens

## 🏗️ Project Architecture

