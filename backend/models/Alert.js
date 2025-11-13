const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  category: String,
  severity: String,

  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

  location: String,
  mediaUrl: String,
  aiConfidence: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Alert", alertSchema);