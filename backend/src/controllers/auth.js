import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// It is a function that is used to generate a JSON Web Token (JWT).
const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const assignedRole = role && ["CITIZEN", "WORKER", "AUTHORITY"].includes(role) ? role : "CITIZEN";

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { uid: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Register error detail:", {
      message: error.message,
      stack: error.stack,
      body: { ...req.body, password: "[REDACTED]" }
    });
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { uid: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Login error detail:", {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};


export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    res.json({ uid: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
