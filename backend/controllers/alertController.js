const Alert = require("../models/Alert");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================
// 📂 File Upload Configuration (Memory Storage for MongoDB)
// ==========================
const storage = multer.memoryStorage();

exports.upload = multer({ storage });

// ==========================
// ➕ CREATE ALERT
// ==========================
exports.createAlert = async (req, res) => {
  try {
    const { title, description, location, latitude, longitude } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let mediaUrl = null;
    if (req.file) {
      const base64Data = req.file.buffer.toString("base64");
      mediaUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    const alert = new Alert({
      userId: req.user.id,
      title,
      description,
      location,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      category: "General",
      severity: "Medium",
      aiConfidence: 0.85,
      mediaUrl,
    });

    await alert.save();
    res.json({ message: "Alert created successfully", alert });
  } catch (err) {
    console.error("❌ ERROR in createAlert:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// 📜 GET ALL ALERTS
// ==========================
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// 📘 GET ONE ALERT BY ID
// ==========================
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alert details" });
  }
};

// ==========================
// 👤 GET MY ALERTS
// ==========================
exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// ❌ DELETE ALERT
// ==========================
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    if (alert.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await alert.deleteOne();
    res.json({ message: "Alert deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// ✏️ UPDATE ALERT
// ==========================
exports.updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Only creator can update
    if (alert.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, location, latitude, longitude, severity, category } = req.body;

    if (title) alert.title = title;
    if (description) alert.description = description;
    if (location) alert.location = location;

    if (latitude) alert.latitude = parseFloat(latitude);
    if (longitude) alert.longitude = parseFloat(longitude);

    if (severity) alert.severity = severity;
    if (category) alert.category = category;

    if (req.file) {
      const base64Data = req.file.buffer.toString("base64");
      alert.mediaUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    await alert.save();
    res.json({ message: "Alert updated successfully", alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
