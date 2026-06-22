import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Complaint } from "../models/Complaint.js";

// Ensure environment variables are loaded
dotenv.config({ path: "../../.env" });
dotenv.config(); // fallback for root .env

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civicproof";

async function seed() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB. Wiping existing data...");

    await User.deleteMany({});
    await Complaint.deleteMany({});

    console.log("Creating Demo Users...");

    const users = await User.create([
      { name: "Jane Citizen", email: "citizen@demo.com", password: "password123", role: "CITIZEN" },
      { name: "John Worker", email: "worker@demo.com", password: "password123", role: "WORKER" },
      { name: "Alice Authority", email: "authority@demo.com", password: "password123", role: "AUTHORITY" },
    ]);

    const citizenId = users[0]._id.toString();
    const workerName = users[1].name;

    console.log("Creating Demo Complaints...");

    // Seed 1: Needs Human Review (Authority sees this)
    await Complaint.create({
      id: "CMPT-1001",
      userId: citizenId,
      category: "Pothole",
      description: "Massive pothole on main street.",
      imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      slaDeadline: new Date(Date.now() + 70 * 60 * 60 * 1000),
      status: "NEEDS_HUMAN_REVIEW",
      resolutionImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800", // Same image to simulate bad worker fix
      verificationScore: 0.95,
      history: [
        { status: "PENDING", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: "Jane Citizen", message: "Complaint filed." },
        { status: "NEEDS_HUMAN_REVIEW", timestamp: new Date(), user: workerName, message: "Worker claims fixed, ML flagged it." }
      ]
    });

    // Seed 2: Pending (Worker sees this)
    await Complaint.create({
      id: "CMPT-1002",
      userId: citizenId,
      category: "Garbage Dump",
      description: "Trash overflowing from bin.",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
      latitude: 12.9720,
      longitude: 77.5950,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 43 * 60 * 60 * 1000),
      status: "PENDING",
      history: [
        { status: "PENDING", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), user: "Jane Citizen", message: "Complaint filed." }
      ]
    });

    // Seed 3: Resolved (Citizen sees this in their history)
    await Complaint.create({
      id: "CMPT-1003",
      userId: citizenId,
      category: "Streetlight",
      description: "Light pole is completely broken.",
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      latitude: 12.9710,
      longitude: 77.5940,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "RESOLVED",
      resolutionImageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
      verificationScore: 0.99,
      verificationLabel: "VERIFIED_RESOLUTION",
      resolvedBy: workerName,
      history: [
        { status: "PENDING", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), user: "Jane Citizen", message: "Complaint filed." },
        { status: "RESOLVED", timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), user: workerName, message: "Fixed by worker." }
      ]
    });

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
