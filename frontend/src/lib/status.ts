import { isComplaintStatus, type ComplaintStatus } from "@/types/complaint";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  Eye,
  ImageOff,
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
}

export const STATUS_META: Record<ComplaintStatus, StatusMeta> = {
  PENDING: {
    status: "PENDING",
    label: "Pending",
    description: "Awaiting verification and action",
    icon: Clock,
    tone: "primary",
  },
  RESOLVED: {
    status: "RESOLVED",
    label: "Resolved",
    description: "Issue resolved and verified",
    icon: CheckCircle2,
    tone: "success",
  },
  REOPENED: {
    status: "REOPENED",
    label: "Reopened",
    description: "Reopened for further review",
    icon: RotateCcw,
    tone: "warning",
  },
  DISMISSED: {
    status: "DISMISSED",
    label: "Dismissed",
    description: "Case dismissed",
    icon: XCircle,
    tone: "muted",
  },
  REJECTED_GPS: {
    status: "REJECTED_GPS",
    label: "Rejected (Location)",
    description: "Evidence location did not match the report",
    icon: MapPinOff,
    tone: "destructive",
  },
  REJECTED_ML: {
    status: "REJECTED_ML",
    label: "Rejected (AI)",
    description: "No matching issue detected by AI",
    icon: ImageOff,
    tone: "destructive",
  },
  REJECTED_MANUAL: {
    status: "REJECTED_MANUAL",
    label: "Rejected",
    description: "Rejected by an authority",
    icon: UserX,
    tone: "destructive",
  },
  NEEDS_HUMAN_REVIEW: {
    status: "NEEDS_HUMAN_REVIEW",
    label: "Needs Review",
    description: "Flagged for human review",
    icon: Eye,
    tone: "warning",
  },
  VERIFIED_TENTATIVE: {
    status: "VERIFIED_TENTATIVE",
    label: "Tentative",
    description: "Resolution tentatively verified",
    icon: SearchCheck,
    tone: "info",
  },
  VERIFIED_RESOLUTION: {
    status: "VERIFIED_RESOLUTION",
    label: "Verified",
    description: "Resolution fully verified",
    icon: ShieldCheck,
    tone: "success",
  },
  SUSPICIOUS: {
    status: "SUSPICIOUS",
    label: "Suspicious",
    description: "Marked as suspicious",
    icon: AlertTriangle,
    tone: "destructive",
  },
  SUSPICIOUS_CONTENT: {
    status: "SUSPICIOUS_CONTENT",
    label: "Suspicious Content",
    description: "Reported content failed AI verification",
    icon: ShieldAlert,
    tone: "destructive",
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

export function statusBadgeClasses(status: string): string {
  if (isComplaintStatus(status)) {
    return TONE_BADGE[statusMeta(status).tone];
  }
  return TONE_BADGE.neutral;
}

export const TONE_HEX: Record<StatusTone, string> = {
  neutral: "#52525b",
  primary: "#0f766e",
  success: "#059669",
  warning: "#d97706",
  destructive: "#e11d48",
  info: "#2563eb",
  muted: "#71717a",
};

export function statusColor(status: string): string {
  return TONE_HEX[statusMeta(status as ComplaintStatus).tone] ?? TONE_HEX.neutral;
}