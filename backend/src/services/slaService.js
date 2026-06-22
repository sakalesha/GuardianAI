import { Complaint } from "../models/Complaint.js";

export const checkOverdueComplaints = async () => {
  try {
    const now = new Date();
    // Find all outstanding complaints that are past the SLA deadline
    // and haven't already had a breach logged in their history.
    const overdueComplaints = await Complaint.find({
      status: "PENDING",
      slaDeadline: { $lte: now },
      slaBreachLogged: false, // Ensures we only log the breach once per complaint
    });

    let count = 0;
    for (const complaint of overdueComplaints) {
      // Add an automated message to the history
      complaint.history.push({
        status: "PENDING",
        timestamp: now,
        user: "System: SLA Monitor",
        message: "Automated alert: This complaint has exceeded its assigned SLA deadline. Priority has been automatically escalated.",
      });

      // Mark the boolean flag as true
      complaint.slaBreachLogged = true;
      
      await complaint.save();
      count++;
    }

    if (count > 0) {
      console.log(`[SLA Tracker] Escalated ${count} overdue complaints.`);
    }

    return { success: true, escalatedCount: count };
  } catch (error) {
    console.error("[SLA Tracker] Error checking for overdue complaints:", error);
    return { success: false, error: error.message };
  }
};
