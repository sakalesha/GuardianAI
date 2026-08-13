import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Plus, RefreshCw, TriangleAlert, X } from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";
import { normalizeError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/complaints/EmptyState";
import { MapView } from "@/features/map/MapView";
import {
  COMPLAINT_CATEGORIES,
  isComplaintCategory,
  isComplaintStatus,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/types/complaint";

function useMapFilters() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category");
  const status = params.get("status");

  const patch = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  return {
    category:
      category && isComplaintCategory(category) ? (category as ComplaintCategory) : undefined,
    status:
      status && isComplaintStatus(status) ? (status as ComplaintStatus) : undefined,
    patch,
  };
}

export function MapPage() {
  const { data = [], isLoading, isError, error, refetch } = useComplaints();
  const { category, status, patch } = useMapFilters();

  const visible = useMemo(
    () =>
      data.filter(
        (c) =>
          (!category || c.category === category) &&
          (!status || c.status === status),
      ),
    [data, category, status],
  );

  const statusCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data) map.set(c.status, (map.get(c.status) ?? 0) + 1);
    return map;
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Map" description="Explore community reports across the city.">
        <Button asChild variant="outline" size="sm">
          <Link to="/report">
            <Plus className="mr-1" />
            Report an issue
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <Select
          value={category ?? "all"}
          onValueChange={(v) => patch({ category: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[10.5rem]" aria-label="Filter map by category">
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
          value={status ?? "all"}
          onValueChange={(v) => patch({ status: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[10.5rem]" aria-label="Filter map by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {[...statusCount.keys()]
              .sort()
              .map((s) => (
                <SelectItem key={s} value={s}>
                  {s} ({statusCount.get(s)})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {category || status ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => patch({ category: undefined, status: undefined })}
          >
            <X className="mr-1" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex h-[70vh] flex-col gap-3">
          <Skeleton className="h-full w-full" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Could not load the map"
          description={normalizeError(error).message}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1" />
              Retry
            </Button>
          }
        />
      ) : (
        <div className="relative h-[70vh] overflow-hidden rounded-lg border shadow-sm">
          <MapView complaints={visible} />
          <div className="absolute right-3 top-3 z-[500] rounded-md border bg-card/95 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              {visible.length} visible on this map
            </span>
          </div>
        </div>
      )}
    </div>
  );
}