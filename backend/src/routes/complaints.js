import { Router } from "express";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  triggerSLACheck
} from "../controllers/complaints.js";

const router = Router();

router.post("/", createComplaint);
router.get("/", getComplaints);
router.get("/:id", getComplaintById);
router.patch("/:id/status", updateComplaintStatus);
router.delete("/:id", deleteComplaint);

// Manual trigger for testing SLA tracker
router.post("/trigger-sla-check", triggerSLACheck);

export default router;
