import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizeError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/complaints/EmptyState";
import { ReportCard } from "@/features/reports/ReportCard";
import {
  COMPLAINT_CATEGORIES,
  isComplaintCategory,
  isComplaintStatus,
  COMPLAINT_STATUSES,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/types/complaint";
import {
  filterComplaints,
  isActionable,
  paginate,
  sortComplaints,
  totalPages,
  type SortKey,
} from "@/lib/filters";

const PAGE_SIZE = 9;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "urgency", label: "SLA urgency" },
];

function useReportsSearchParams(isWorker: boolean) {
  const [params, setParams] = useSearchParams();
  const rawQ = params.get("q") ?? "";
  const category = params.get("category");
  const status = params.get("status");
  const sortParam = params.get("sort");
  const pageParam = params.get("page");
  const view = params.get("view");

  const queueOpen = isWorker ? view !== "all" : false;
  const defaultSort: SortKey = isWorker && queueOpen ? "urgency" : "newest";

  const filters = {
    q: rawQ,
    category:
      category && isComplaintCategory(category) ? (category as ComplaintCategory) : undefined,
    status:
      status && isComplaintStatus(status) ? (status as ComplaintStatus) : undefined,
    sort: (sortParam === "oldest" || sortParam === "urgency" ? sortParam : defaultSort) as SortKey,
  };
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const patch = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
    }
    if ("q" in changes || "category" in changes || "status" in changes || "view" in changes) {
      next.delete("page");
    }
    setParams(next, { replace: true });
  };

  return { filters, page, patch, view, queueOpen, defaultSort };
}

export function ReportsPage() {
  const { user } = useAuth();
  const { data = [], isLoading, isError, error, refetch } = useComplaints();
  const isWorker = user?.role === "WORKER";
  const { filters, page, patch, queueOpen, defaultSort } = useReportsSearchParams(isWorker);

  const debouncedQ = useDebouncedValue(filters.q, 250);

  const base = useMemo(
    () =>
      user?.role === "CITIZEN"
        ? data.filter((c) => c.userId === user.uid)
        : data,
    [data, user],
  );

  const scoped = useMemo(() => {
    if (!queueOpen) return base;
    return base.filter((c) => isActionable(c.status));
  }, [base, queueOpen]);

  const filtered = useMemo(
    () => filterComplaints(scoped, { ...filters, q: debouncedQ }),
    [scoped, filters, debouncedQ],
  );

  const sorted = useMemo(() => sortComplaints(filtered, filters.sort), [filtered, filters.sort]);
  const pageCount = totalPages(sorted.length, PAGE_SIZE);
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(() => paginate(sorted, safePage, PAGE_SIZE), [sorted, safePage]);

  const isCitizen = user?.role === "CITIZEN";

  const title = isWorker ? "Job Queue" : isCitizen ? "My Reports" : "All Reports";
  const description = isWorker
    ? "Open issues awaiting resolution, ordered by SLA urgency."
    : isCitizen
      ? "Track and manage the issues you have reported."
      : "Search and review every community report.";

  const reset = () =>
    patch({ q: "", category: undefined, status: undefined, sort: defaultSort, page: "1" });

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <Button asChild variant="outline" size="sm">
          <Link to="/report">
            <RefreshCw className="mr-1" />
            Report an issue
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {isWorker && (
          <Tabs
            value={queueOpen ? "open" : "all"}
            onValueChange={(v) => patch({ view: v === "open" ? undefined : "all", page: "1" })}
          >
            <TabsList>
              <TabsTrigger value="open">Open jobs</TabsTrigger>
              <TabsTrigger value="all">All reports</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              value={filters.q}
              onChange={(e) => patch({ q: e.target.value })}
              placeholder="Search by ID, category, description…"
              className="pl-9!"
              aria-label="Search reports"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.category ?? "all"}
              onValueChange={(v) => patch({ category: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-[10.5rem]" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) => patch({ status: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-[10.5rem]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {COMPLAINT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={(v) => patch({ sort: v })}>
              <SelectTrigger className="w-[10.5rem]" aria-label="Sort reports">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-3">
              <Skeleton className="aspect-[16/10] w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Could not load reports"
          description={normalizeError(error).message}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1" />
              Retry
            </Button>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          variant={isCitizen ? "no-reports" : queueOpen ? "no-jobs" : "no-results"}
          title={queueOpen ? "No open jobs right now" : isCitizen ? "No reports yet" : "No matches"}
          description={
            queueOpen
              ? "All actionable issues have been cleared. New reports will appear here."
              : isCitizen
                ? "Report an issue to see it tracked here with its SLA deadline."
                : "Try adjusting your search or filters."
          }
          action={
            isCitizen ? (
              <Button asChild size="sm">
                <Link to="/report">Report an issue</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            {sorted.length} {sorted.length === 1 ? "report" : "reports"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((c) => (
              <ReportCard key={c.id} complaint={c} showSla={!queueOpen || isActionable(c.status)} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => patch({ page: String(safePage - 1) })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount}
                onClick={() => patch({ page: String(safePage + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}