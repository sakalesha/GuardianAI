import type { Complaint, ComplaintStatus } from "@/types/complaint";
import { isActionable } from "@/lib/filters";
import { isReviewable } from "@/lib/review";
import { statusMeta } from "@/lib/status";

export interface NotificationEvent {
  id: string;
  complaintId: string;
  category: string;
  from: ComplaintStatus;
  to: ComplaintStatus;
  message: string;
  timestamp: string;
}

export type NotificationScope = "citizen" | "worker" | "authority";

export interface DiffContext {
  uid: string;
  scope: NotificationScope;
  actors: readonly string[];
}

const ROLE_ACTOR_LABELS: Record<NotificationScope, string> = {
  citizen: "Citizen",
  worker: "Authority Officer",
  authority: "Authority",
};

export function actorsForRole(
  scope: NotificationScope,
  displayName: string,
): string[] {
  return [displayName, ROLE_ACTOR_LABELS[scope]].filter(Boolean);
}

export function scopeForRole(role: string | undefined): NotificationScope | null {
  if (role === "CITIZEN") return "citizen";
  if (role === "WORKER") return "worker";
  if (role === "AUTHORITY") return "authority";
  return null;
}

function recentActor(complaint: Complaint): string {
  return complaint.history[complaint.history.length - 1]?.user ?? "";
}

function eventMessage(
  complaint: Complaint,
  from: ComplaintStatus,
  to: ComplaintStatus,
  scope: NotificationScope,
): string {
  const toLabel = statusMeta(to).label;
  if (scope === "citizen") {
    return `Your ${complaint.category} report ${complaint.id} is now ${toLabel}.`;
  }
  return `${complaint.id} (${complaint.category}) moved from ${statusMeta(from).label} to ${toLabel}.`;
}

export function notificationEvents(
  prev: Complaint[],
  next: Complaint[],
  ctx: DiffContext,
): NotificationEvent[] {
  const prevById = new Map(prev.map((c) => [c.id, c]));
  const events: NotificationEvent[] = [];

  for (const curr of next) {
    const before = prevById.get(curr.id);
    if (!before || before.status === curr.status) continue;

    const mine = ctx.scope === "citizen" ? curr.userId === ctx.uid : false;
    if (!mine && ctx.actors.includes(recentActor(curr))) continue;

    if (ctx.scope === "citizen") {
      if (!mine) continue;
    } else if (ctx.scope === "worker") {
      if (isActionable(before.status) === isActionable(curr.status)) continue;
    } else if (ctx.scope === "authority") {
      if (isReviewable(before.status) === isReviewable(curr.status)) continue;
    }

    events.push({
      id: `${curr.id}-${Date.now()}`,
      complaintId: curr.id,
      category: curr.category,
      from: before.status,
      to: curr.status,
      message: eventMessage(curr, before.status, curr.status, ctx.scope),
      timestamp: new Date().toISOString(),
    });
  }

  return events;
}