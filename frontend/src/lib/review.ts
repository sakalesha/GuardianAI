import type { ComplaintStatus, HistoryEntry } from "@/types/complaint";

export type AuthorityActionTone = "default" | "warning" | "destructive";

export interface AuthorityAction {
  key: "approve" | "reject" | "reopen" | "suspicious" | "dismiss";
  label: string;
  description: string;
  targetStatus: ComplaintStatus;
  tone: AuthorityActionTone;
  confirm?: boolean;
}

const REVIEWABLE_STATUSES: readonly ComplaintStatus[] = [
  "RESOLVED",
  "VERIFIED_TENTATIVE",
  "NEEDS_HUMAN_REVIEW",
  "REJECTED_ML",
  "REJECTED_GPS",
  "SUSPICIOUS_CONTENT",
];

export function isReviewable(status: ComplaintStatus): boolean {
  return (REVIEWABLE_STATUSES as readonly string[]).includes(status);
}

export function authorityActionsFor(status: ComplaintStatus): AuthorityAction[] {
  if (isReviewable(status)) {
    return [
      {
        key: "approve",
        label: "Approve resolution",
        description:
          "Mark the submitted resolution as fully verified and close the case.",
        targetStatus: "VERIFIED_RESOLUTION",
        tone: "default",
      },
      {
        key: "reopen",
        label: "Reopen",
        description:
          "Send the case back to the worker queue for a new resolution attempt.",
        targetStatus: "REOPENED",
        tone: "warning",
      },
      {
        key: "reject",
        label: "Reject resolution",
        description:
          "Reject the submitted resolution and flag the case as rejected by an authority.",
        targetStatus: "REJECTED_MANUAL",
        tone: "destructive",
        confirm: true,
      },
    ];
  }

  return [
    {
      key: "reopen",
      label: "Reopen",
      description: "Send the case back to the worker queue for action.",
      targetStatus: "REOPENED",
      tone: "warning",
    },
    {
      key: "suspicious",
      label: "Mark suspicious",
      description: "Flag this report as suspicious content.",
      targetStatus: "SUSPICIOUS",
      tone: "destructive",
      confirm: true,
    },
    {
      key: "dismiss",
      label: "Dismiss",
      description: "Close the case as not a valid civic issue.",
      targetStatus: "DISMISSED",
      tone: "destructive",
      confirm: true,
    },
  ];
}

export function authorityHistoryEntry(action: AuthorityAction): HistoryEntry {
  return {
    status: action.targetStatus,
    timestamp: new Date().toISOString(),
    user: "Authority",
    message: `${action.label}.`,
  };
}
