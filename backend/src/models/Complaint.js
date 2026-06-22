import mongoose, { Schema } from "mongoose";

const ComplaintSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    slaDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "PENDING",
        "RESOLVED",
        "REOPENED",
        "DISMISSED",
        "REJECTED_GPS",
        "REJECTED_ML",
        "REJECTED_MANUAL",
        "NEEDS_HUMAN_REVIEW",
        "VERIFIED_TENTATIVE",
        "VERIFIED_RESOLUTION",
        "SUSPICIOUS",
        "SUSPICIOUS_CONTENT"
      ],
      default: "PENDING",
    },
    mlMetadata: {
      detectedIssues: [
        {
          label: String,
          confidence: Number,
          box: [Number]
        }
      ],
      hasValidIssue: { type: Boolean, default: false }
    },
    slaBreachLogged: { type: Boolean, default: false },
    verificationData: {
      isValid: { type: Boolean, default: true },
      distanceMeters: { type: Number },
      timeDifferenceHours: { type: Number },
      reason: { type: String }
    },
    resolutionImageUrl: { type: String },
    resolutionTimestamp: { type: Date },
    resolutionLatitude: { type: Number },
    resolutionLongitude: { type: Number },
    verificationScore: { type: Number },
    verificationLabel: { type: String },
    resolvedBy: { type: String },
    history: [
      {
        status: String,
        timestamp: Date,
        user: String,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Complaint = mongoose.model("Complaint", ComplaintSchema);
