import type { Complaint, ComplaintCategory, ComplaintStatus } from "@/types/complaint";
import { isActionable } from "@/lib/filters";
import { CATEGORY_COLORS } from "@/lib/categories";
import { STATUS_META, statusColor } from "@/lib/status";

export interface Analytics {
  total: number;
  open: number;
  overdue: number;
  avgResolutionHours: number | null;
  verificationPassRate: number | null;
  resolved7d: number;
  statusData: { name: string; value: number; color: string }[];
  categoryData: { category: ComplaintCategory; count: number; color: string }[];
  trendData: { date: string; count: number }[];
  slaData: { category: ComplaintCategory; withinSla: number; breached: number; open: number }[];
}

const HOURS = 1000 * 60 * 60;

const ATTEMPTED_STATUSES: readonly ComplaintStatus[] = [
  "RESOLVED",
  "VERIFIED_RESOLUTION",
  "REJECTED_GPS",
  "REJECTED_ML",
  "REJECTED_MANUAL",
];

function isResolvedStatus(status: ComplaintStatus): boolean {
  return status === "RESOLVED" || status === "VERIFIED_RESOLUTION";
}

function resolutionTimestamp(complaint: Complaint): number | null {
  const entry = complaint.history.find((h) => h.status === "RESOLVED");
  return entry ? new Date(entry.timestamp).getTime() : null;
}

export function computeAnalytics(complaints: Complaint[]): Analytics {
  const now = Date.now();
  const total = complaints.length;

  const open = complaints.filter((c) => isActionable(c.status)).length;
  const overdue = complaints.filter(
    (c) => isActionable(c.status) && now > new Date(c.slaDeadline).getTime(),
  ).length;

  const resolved = complaints.filter((c) => isResolvedStatus(c.status));
  const timed = resolved
    .map((c) => ({ complaint: c, ts: resolutionTimestamp(c) }))
    .filter((x): x is { complaint: Complaint; ts: number } => x.ts !== null);
  const avgResolutionHours = timed.length
    ? timed.reduce(
        (sum, x) => sum + (x.ts - new Date(x.complaint.timestamp).getTime()) / HOURS,
        0,
      ) / timed.length
    : null;

  const attempted = complaints.filter((c) =>
    (ATTEMPTED_STATUSES as readonly string[]).includes(c.status),
  ).length;
  const verificationPassRate = attempted
    ? (resolved.length / attempted) * 100
    : null;

  const resolved7d = timed.filter((x) => x.ts >= now - 7 * 24 * HOURS).length;

  const statusCount = new Map<string, number>();
  for (const c of complaints) statusCount.set(c.status, (statusCount.get(c.status) ?? 0) + 1);
  const statusData = [...statusCount.entries()]
    .map(([status, value]) => ({
      name: STATUS_META[status as ComplaintStatus]?.label ?? status,
      value,
      color: statusColor(status),
    }))
    .sort((a, b) => b.value - a.value);

  const catCount = new Map<string, number>();
  for (const c of complaints) catCount.set(c.category, (catCount.get(c.category) ?? 0) + 1);
  const categoryData = [...catCount.entries()]
    .map(([category, count]) => ({
      category: category as ComplaintCategory,
      count,
      color: CATEGORY_COLORS[category as ComplaintCategory] ?? "#71717a",
    }))
    .sort((a, b) => b.count - a.count);

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayKeys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(dayStart);
    d.setDate(dayStart.getDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const dayCounts = new Map(dayKeys.map((k) => [k, 0]));
  for (const c of complaints) {
    const key = new Date(c.timestamp).toISOString().slice(0, 10);
    if (dayCounts.has(key)) dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const trendData = dayKeys.map((date) => ({ date, count: dayCounts.get(date) ?? 0 }));

  const categories = [...new Set(complaints.map((c) => c.category))] as ComplaintCategory[];
  const slaData = categories.map((category) => {
    let withinSla = 0;
    let breached = 0;
    let openCount = 0;
    for (const c of complaints) {
      if (c.category !== category) continue;
      if (isActionable(c.status)) {
        openCount++;
        continue;
      }
      if (isResolvedStatus(c.status)) {
        const ts = resolutionTimestamp(c);
        if (ts === null) continue;
        if (ts <= new Date(c.slaDeadline).getTime()) withinSla++;
        else breached++;
      }
    }
    return { category, withinSla, breached, open: openCount };
  });

  return {
    total,
    open,
    overdue,
    avgResolutionHours,
    verificationPassRate,
    resolved7d,
    statusData,
    categoryData,
    trendData,
    slaData,
  };
}