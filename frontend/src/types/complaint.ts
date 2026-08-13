export const COMPLAINT_STATUSES = [
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
  "SUSPICIOUS_CONTENT",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export function isComplaintStatus(value: unknown): value is ComplaintStatus {
  return (
    typeof value === "string" &&
    (COMPLAINT_STATUSES as readonly string[]).includes(value)
  );
}

export const COMPLAINT_CATEGORIES = [
  "Pothole",
  "Garbage",
  "Streetlight",
  "Water Leakage",
  "Fallen Tree",
  "Other",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export function isComplaintCategory(value: unknown): value is ComplaintCategory {
  return (
    typeof value === "string" &&
    (COMPLAINT_CATEGORIES as readonly string[]).includes(value)
  );
}

export interface Detection {
  label: string;
  original_object?: string;
  confidence: number;
  box: [number, number, number, number];
}

export interface MlMetadata {
  detectedIssues: Detection[];
  hasValidIssue: boolean;
}

export interface VerificationData {
  isValid: boolean;
  distanceMeters: number;
  timeDifferenceHours: number;
  reason: string;
}

export interface HistoryEntry {
  status: ComplaintStatus;
  timestamp: string;
  user?: string;
  message?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  category: ComplaintCategory;
  description?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  slaDeadline: string;
  status: ComplaintStatus;
  mlMetadata: MlMetadata;
  slaBreachLogged: boolean;
  verificationData: VerificationData;
  resolutionImageUrl?: string;
  resolutionTimestamp?: string;
  resolutionLatitude?: number;
  resolutionLongitude?: number;
  verificationScore?: number;
  verificationLabel?: string;
  resolvedBy?: string;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintPayload {
  category: ComplaintCategory;
  description?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  slaDeadline: string;
  userId: string;
}

export interface UpdateStatusPayload {
  status: ComplaintStatus;
  resolutionImageUrl?: string;
  resolutionLatitude?: number;
  resolutionLongitude?: number;
  history?: HistoryEntry[];
}