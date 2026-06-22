import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import complaintsRouter from "./routes/complaints.js";
import authRouter from "./routes/auth.js";
import cron from "node-cron";
import { checkOverdueComplaints } from "./services/slaService.js";

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Configure Cloudinary
configureCloudinary();

// Middleware
app.use(cors());
// Increase JSON payload limit for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  
  // Start the SLA Tracker cron job to run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("[Cron] Running scheduled SLA check...");
    await checkOverdueComplaints();
  });
});
