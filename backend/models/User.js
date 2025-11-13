const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String },
  role: { type: String, enum: ["resident", "admin"], default: "resident" }
});

module.exports = mongoose.model("User", userSchema);
