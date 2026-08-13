import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from "@/types/complaint";

export const ACTIONABLE_STATUSES: readonly ComplaintStatus[] = [
  "PENDING",
  "REOPENED",
  "NEEDS_HUMAN_REVIEW",
  "VERIFIED_TENTATIVE",
];

export function isActionable(status: ComplaintStatus): boolean {
  return (ACTIONABLE_STATUSES as readonly string[]).includes(status);
}

export type SortKey = "newest" | "oldest" | "urgency";

export interface ComplaintFilterState {
  q: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  sort: SortKey;
}

export function matchesSearch(complaint: Complaint, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [
    complaint.id,
    complaint.category,
    complaint.description ?? "",
    complaint.status,
  ].some((field) => field.toLowerCase().includes(needle));
}

export function sortComplaints(
  complaints: Complaint[],
  sort: SortKey,
): Complaint[] {
  const list = [...complaints];
  switch (sort) {
    case "newest":
      list.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      break;
    case "oldest":
      list.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
      break;
    case "urgency": {
      const actionable = (c: Complaint) => isActionable(c.status) ? 0 : 1;
      list.sort(
        (a, b) =>
          actionable(a) - actionable(b) ||
          +new Date(a.slaDeadline) - +new Date(b.slaDeadline),
      );
      break;
    }
  }
  return list;
}

export function filterComplaints(
  complaints: Complaint[],
  filters: ComplaintFilterState,
): Complaint[] {
  const { q, category, status } = filters;
  return complaints.filter(
    (c) =>
      matchesSearch(c, q) &&
      (!category || c.category === category) &&
      (!status || c.status === status),
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  return items.slice((safePage - 1) * pageSize, safePage * pageSize);
}

export function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}