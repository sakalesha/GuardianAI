import { Complaint } from "../models/Complaint.js";
import { Counter } from "../models/Counter.js";
import { cloudinary } from "../config/cloudinary.js";
import { validateGPSData, calculateDistanceMeters } from "../services/gpsValidator.js";


export const createComplaint = async (req, res) => {
  try {
    const {
      category,
      description,
      imageUrl,
      latitude,
      longitude,
      slaDeadline,
      status,
      history,
    } = req.body;

    let uploadedImageUrl = "";
    // If the imageUrl is a base64 string, upload to Cloudinary
    // data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGB...
    // [-- Header ---][Type][---- Actual Encoded Image Data ----]

    if (imageUrl && imageUrl.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "civicproof/complaints",
        resource_type: "image",
      });
      uploadedImageUrl = uploadResponse.secure_url;
    } else {
      uploadedImageUrl = imageUrl;
    }

    // Generate sequential ID using a Counter collection
    const counter = await Counter.findByIdAndUpdate(
      "complaintId",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const generatedId = `CP-${String(counter.seq).padStart(5, '0')}`;

    // Validate the image GPS against reported device GPS
    const verificationData = await validateGPSData(imageUrl, latitude, longitude);

    // AI Analysis: Detect issues in the image before saving
    let mlMetadata = { detectedIssues: [], hasValidIssue: false };
    try {
      const mlApiUrl = process.env.ML_API_URL || "http://localhost:5000";
      const mlResponse = await fetch(`${mlApiUrl}/analyze-issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl })
      });
      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        mlMetadata = {
          detectedIssues: mlResult.detections || [],
          hasValidIssue: mlResult.has_issue || false
        };
      }
    } catch (err) {
      console.error("ML Analysis Service unavailable during creation:", err.message);
    }

    const newComplaint = new Complaint({
      id: generatedId,
      userId: req.body.userId || "anonymous",
      category,
      description,
      imageUrl: uploadedImageUrl,
      latitude,
      longitude,
      verificationData,
      mlMetadata,
      slaDeadline: slaDeadline || new Date(Date.now() + 72 * 60 * 60 * 1000), // default 72h
      status: (!mlMetadata.hasValidIssue && mlMetadata.detectedIssues.length === 0) ? "SUSPICIOUS_CONTENT" : (status || "PENDING"),
      history: history || [
        {
          status: "PENDING",
          timestamp: new Date(),
          user: "Citizen",
          message: mlMetadata.hasValidIssue 
            ? `Complaint filed. AI detected: ${mlMetadata.detectedIssues.map(d => d.label).join(", ")}.`
            : "Complaint filed. Note: AI did not detect a clear civic issue in the photo.",
        },
      ],
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ error: "Failed to create complaint" });
  }
};


export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ timestamp: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};


export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
};


export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    let uploadedImageUrl = updateData.resolutionImageUrl;
    let finalStatus = updateData.status;

    // We fetch the existing complaint to run comparative verification
    const existingComplaint = await Complaint.findOne({ id });
    if (!existingComplaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Is this a Resolution Upload attempt from a Worker?
    if (uploadedImageUrl && updateData.resolutionLatitude && updateData.resolutionLongitude) {
      // First, add the Officer's resolution attempt to the history
      finalStatus = "RESOLVED";
      updateData.history = [
        ...existingComplaint.history,
        {
          status: "RESOLVED",
          timestamp: new Date(),
          user: "Authority Officer",
          message: "Resolution submitted. Awaiting ML verification.",
        }
      ];

      // Gatekeeper 1: Device-Based Proximity Check (Worker must be at the site)
      const distance = calculateDistanceMeters(
        existingComplaint.latitude,
        existingComplaint.longitude,
        updateData.resolutionLatitude,
        updateData.resolutionLongitude
      );

      if (distance > 500) {
        // Auto-Reject: Worker is too far from the report site
        await Complaint.findOneAndUpdate(
          { id },
          {
            $set: { status: "REJECTED_GPS" },
            $push: {
              history: {
                status: "REJECTED_GPS",
                timestamp: new Date(),
                user: "System_Gatekeeper",
                message: `Automated Rejection: Worker device location (${distance}m) exceeds 500m limit.`,
              },
            },
          }
        );
        return res.status(406).json({ 
          error: "Resolution Rejected", 
          message: `Worker is too far from the site: ${distance}m (Limit: 500m)` 
        });
      }

      // Optional Audit: Extract EXIF for secondary logging (Non-blocking)
      const gpsValidation = await validateGPSData(
        uploadedImageUrl,
        updateData.resolutionLatitude,
        updateData.resolutionLongitude
      );
      updateData.verificationData = gpsValidation;

      // Gatekeeper 2: YOLO + ORB Feature Matching
      try {
        const mlApiUrl = process.env.ML_API_URL || "http://localhost:5000";
        const mlResponse = await fetch(`${mlApiUrl}/verify-resolution`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             beforeImage: existingComplaint.imageUrl,
             afterImage: uploadedImageUrl,
          })
        });

        if (mlResponse.ok) {
           const mlResult = await mlResponse.json();
           updateData.verificationScore = mlResult.score;
           updateData.verificationLabel = mlResult.label;

           // Auto-Reject / Status Update Logic
           if (mlResult.label === "SUSPICIOUS_DIFFERENT_LOCATION") {
               finalStatus = "REJECTED_ML";
               updateData.history = [
                 ...(updateData.history || existingComplaint.history),
                 {
                   status: "REJECTED_ML",
                   timestamp: new Date(),
                   user: "System_ML_Auditor",
                   message: `Verification Failed: ${mlResult.reasoning}`,
                 }
               ];
               updateData.status = finalStatus;
           } else if (mlResult.label === "VERIFIED_RESOLUTION") {
               finalStatus = "RESOLVED";
               updateData.history = [
                ...(updateData.history || existingComplaint.history),
                {
                  status: "RESOLVED",
                  timestamp: new Date(),
                  user: "System_ML_Auditor",
                  message: `Auto-Verified: ${mlResult.reasoning}`,
                }
              ];
              updateData.status = finalStatus;
           } else {
               // NEEDS_HUMAN_REVIEW or VERIFIED_TENTATIVE
               finalStatus = mlResult.label;
               updateData.status = finalStatus;
               updateData.history = [
                ...(updateData.history || existingComplaint.history),
                {
                  status: mlResult.label,
                  timestamp: new Date(),
                  user: "System_ML_Auditor",
                  message: `AI Review: ${mlResult.reasoning}`,
                }
              ];
           }
        }
      } catch (err) {
        console.error("Failed to reach Python ML Service during gatekeeping.", err);
        return res.status(503).json({ error: "ML Verification Service is offline." });
      }
    }

    // Handle base64 image upload for resolutions (only if not rejected)
    if (uploadedImageUrl && uploadedImageUrl.startsWith("data:image") && !finalStatus.startsWith("REJECTED")) {
      const uploadResponse = await cloudinary.uploader.upload(uploadedImageUrl, {
        folder: "civicproof/resolutions",
        resource_type: "image",
      });
      uploadedImageUrl = uploadResponse.secure_url;
      updateData.resolutionImageUrl = uploadedImageUrl;
    }

    if (finalStatus.startsWith("REJECTED")) {
      // Do not save the fraudulent base64 string to DB payload to save space
      delete updateData.resolutionImageUrl;
    }

    const complaint = await Complaint.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ error: "Failed to update complaint status" });
  }
};


export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const complaint = await Complaint.findOne({ id });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Ownership Check: Only allow deletion if the userId matches or if the request 
    // comes from an admin (for now, simply checking if userId is provided and matches)
    if (complaint.userId !== userId) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "You do not have permission to delete this complaint." 
      });
    }

    await Complaint.findOneAndDelete({ id });

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
};

export const triggerSLACheck = async (req, res) => {
  const { checkOverdueComplaints } = await import("../services/slaService.js");
  const result = await checkOverdueComplaints();
  if (result.success) {
    res.status(200).json({ message: `Successfully escalated ${result.escalatedCount} overdue complaints.` });
  } else {
    res.status(500).json({ error: "Failed to run SLA check", details: result.error });
  }
};
