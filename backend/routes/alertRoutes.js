const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createAlert,
  getAlerts,
  getMyAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  upload
} = require("../controllers/alertController");

// 🆕 Create alert (with media upload)
router.post("/", authMiddleware, upload.single("media"), createAlert);

// 📌 Get alerts (dashboard)
router.get("/", authMiddleware, getAlerts);

// 👤 Get alerts created by logged-in user
router.get("/mine", authMiddleware, getMyAlerts);

// 🧾 Get a single alert (must be above :id routes)
router.get("/:id", authMiddleware, getAlertById);

// ✏️ Update alert (title/desc/media/severity/location)
router.put("/:id", authMiddleware, upload.single("media"), updateAlert);
// or PATCH if partial updates:
// router.patch("/:id", authMiddleware, upload.single("media"), updateAlert);

// ❌ Delete alert
router.delete("/:id", authMiddleware, deleteAlert);

module.exports = router;
