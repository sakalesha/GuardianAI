import { isComplaintStatus, type ComplaintStatus } from "@/types/complaint";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  Eye,
  ImageOff,
  MapPin,
  MapPinOff,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted";

export const TONE_BADGE: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-info/30 bg-info/10 text-info",
  muted: "border-border bg-secondary text-muted-foreground",
};

export interface StatusMeta {
  status: ComplaintStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: StatusTone;
  citizenLabel?: string;
  citizenIcon?: LucideIcon;
}

// Citizen-facing status lifecycle:
// Reported -> Under Review -> Verified -> In Progress -> Resolved
// Rejected / Dismissed

export const STATUS_META: Record<ComplaintStatus, StatusMeta> = {
  PENDING: {
    status: "PENDING",
    label: "Reported",
    description: "Report submitted, awaiting initial review",
    citizenLabel: "Reported",
    icon: MapPin,
    tone: "primary",
    citizenIcon: MapPin,
  },
  RESOLVED: {
    status: "RESOLVED",
    label: "Resolved",
    description: "Issue resolved and verified",
    citizenLabel: "Resolved",
    icon: CheckCircle2,
    tone: "success",
    citizenIcon: CheckCircle2,
  },
  REOPENED: {
    status: "REOPENED",
    label: "Reopened",
    description: "Reopened for further review",
    citizenLabel: "Reopened",
    icon: RotateCcw,
    tone: "warning",
    citizenIcon: RotateCcw,
  },
  DISMISSED: {
    status: "DISMISSED",
    label: "Dismissed",
    description: "Case dismissed",
    citizenLabel: "Dismissed",
    icon: XCircle,
    tone: "muted",
    citizenIcon: XCircle,
  },
  REJECTED_GPS: {
    status: "REJECTED_GPS",
    label: "Rejected (Location)",
    description: "Evidence location did not match the report",
    citizenLabel: "Rejected",
    icon: MapPinOff,
    tone: "destructive",
    citizenIcon: AlertTriangle,
  },
  REJECTED_ML: {
    status: "REJECTED_ML",
    label: "Rejected (AI)",
    description: "No matching issue detected by AI",
    citizenLabel: "Rejected",
    icon: ImageOff,
    tone: "destructive",
    citizenIcon: AlertTriangle,
  },
  REJECTED_MANUAL: {
    status: "REJECTED_MANUAL",
    label: "Rejected",
    description: "Rejected by an authority",
    citizenLabel: "Rejected",
    icon: UserX,
    tone: "destructive",
    citizenIcon: AlertTriangle,
  },
  NEEDS_HUMAN_REVIEW: {
    status: "NEEDS_HUMAN_REVIEW",
    label: "Under Review",
    description: "Flagged for human review",
    citizenLabel: "Under Review",
    icon: Eye,
    tone: "warning",
    citizenIcon: Clock,
  },
  VERIFIED_TENTATIVE: {
    status: "VERIFIED_TENTATIVE",
    label: "Verified",
    description: "Resolution tentatively verified",
    citizenLabel: "Verified",
    icon: SearchCheck,
    tone: "info",
    citizenIcon: CheckCircle2,
  },
  VERIFIED_RESOLUTION: {
    status: "VERIFIED_RESOLUTION",
    label: "Verified",
    description: "Resolution fully verified",
    citizenLabel: "Verified",
    icon: ShieldCheck,
    tone: "success",
    citizenIcon: CheckCircle2,
  },
  SUSPICIOUS: {
    status: "SUSPICIOUS",
    label: "Flagged",
    description: "Marked as suspicious",
    citizenLabel: "Flagged",
    icon: AlertTriangle,
    tone: "destructive",
    citizenIcon: AlertTriangle,
  },
  SUSPICIOUS_CONTENT: {
    status: "SUSPICIOUS_CONTENT",
    label: "Flagged",
    description: "Reported content failed AI verification",
    citizenLabel: "Flagged",
    icon: ShieldAlert,
    tone: "destructive",
    citizenIcon: AlertTriangle,
  },
};

export function statusMeta(status: ComplaintStatus): StatusMeta {
  return STATUS_META[status] ?? {
    status,
    label: status,
    description: "",
    icon: CircleDot,
    tone: "neutral",
  };
}

export function getCitizenLabel(status: ComplaintStatus): string {
  return STATUS_META[status]?.citizenLabel ?? statusMeta(status).label;
}

export function getCitizenIcon(status: ComplaintStatus): LucideIcon {
  return STATUS_META[status]?.citizenIcon ?? statusMeta(status).icon;
}

export function statusBadgeClasses(status: string): string {
  if (isComplaintStatus(status)) {
    return TONE_BADGE[statusMeta(status).tone];
  }
  return TONE_BADGE.neutral;
}

export const TONE_HEX: Record<StatusTone, string> = {
  neutral: "#52525b",
  primary: "#5E6AD2",
  success: "#059669",
  warning: "#d97706",
  destructive: "#e11d48",
  info: "#2563eb",
  muted: "#71717a",
};

export function statusColor(status: string): string {
  return TONE_HEX[statusMeta(status as ComplaintStatus).tone] ?? TONE_HEX.neutral;
}