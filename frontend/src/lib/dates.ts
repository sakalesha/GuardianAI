import { format, formatDistanceToNowStrict, intervalToDuration, isPast } from "date-fns";

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy · h:mm a");
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "h:mm a");
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy");
}

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function hoursUntil(iso: string): number {
  const deadline = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((deadline - now) / 3_600_000 * 10) / 10);
}

export interface SlaState {
  overdue: boolean;
  label: string;
  urgent: boolean;
}

export function slaState(deadlineIso: string, now = Date.now()): SlaState {
  const deadline = new Date(deadlineIso).getTime();
  if (Number.isNaN(deadline)) return { overdue: false, label: "No deadline", urgent: false };

  if (isPast(new Date(deadline))) {
    const diff = Math.abs(deadline - now);
    const duration = intervalToDuration({ start: 0, end: diff });
    const hours = duration.hours ?? 0;
    const days = duration.days ?? 0;
    const label =
      days > 0 ? `${days}d ${hours}h overdue` : hours > 0 ? `${hours}h overdue` : "Overdue";
    return { overdue: true, label, urgent: true };
  }

  const hoursLeft = (deadline - now) / 3_600_000;
  const urgent = hoursLeft <= 12;
  const label = hoursLeft < 1 ? "<1h left" : hoursLeft < 24 ? `${Math.round(hoursLeft)}h left` : `${Math.round(hoursLeft / 24)}d left`;
  return { overdue: false, label, urgent };
}