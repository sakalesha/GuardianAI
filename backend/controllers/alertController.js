const Alert = require("../models/Alert");
const multer = require("multer");
const path = require("path");

// ==========================
// 📂 File Upload Configuration
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
exports.upload = multer({ storage });

// ==========================
// ➕ CREATE ALERT
// ==========================
exports.createAlert = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Temporary AI placeholders
    const category = "General";
    const severity = "Medium";
    const aiConfidence = 0.85;

    const alert = new Alert({
      userId: req.user.id,
      title,
      description,
      category,
      severity,
      latitude,
      longitude,
      location: req.body.location || "",
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await alert.save();
    res.json({ message: "Alert created successfully", alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// 📜 GET ALL ALERTS (Dashboard)
// ==========================
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
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
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
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
    const userId = req.user.id;
    const alerts = await Alert.find({ userId }).sort({ timestamp: -1 });
    res.json(alerts);
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

    // Allow update only by owner or admin
    if (alert.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description, location, severity, category } = req.body;

    if (title) alert.title = title;
    if (description) alert.description = description;
    if (location) alert.location = location;
    if (severity) alert.severity = severity;
    if (category) alert.category = category;

    // 🖼️ Update media file if new file uploaded
    if (req.file) {
      alert.mediaUrl = `/uploads/${req.file.filename}`;
    }

    await alert.save();
    res.json({ message: "Alert updated successfully", alert });
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

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Only creator or admin may delete
    if (alert.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await alert.deleteOne();
    res.json({ message: "Alert deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
