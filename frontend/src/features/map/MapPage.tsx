import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Plus, RefreshCw, X, Filter, Search } from "lucide-react";
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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

  const categoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of data) map.set(c.category, (map.get(c.category) ?? 0) + 1);
    return map;
  }, [data]);

  // Request user location for map centering
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Map" description="Explore and track community reports across your city." showBreadcrumbs={false}>
        <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/report">
            <Plus className="mr-1" />
            Report an issue
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search reports by ID, location, description..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/10 bg-[#0F0F12] text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
            onChange={(e) => patch({ q: e.target.value || undefined, page: undefined })}
            aria-label="Search reports"
          />
        </div>

        <Select value={category ?? "all"} onValueChange={(v) => patch({ category: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-[10.5rem]" aria-label="Filter map by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {COMPLAINT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="flex items-center gap-2">
                  {c}
                  {categoryCount.get(c) !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">{categoryCount.get(c)}</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status ?? "all"} onValueChange={(v) => patch({ status: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-[10.5rem]" aria-label="Filter map by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {[...statusCount.keys()].sort().map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2">
                  {s}
                  {statusCount.get(s) !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">{statusCount.get(s)}</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(category || status) ? (
          <Button variant="ghost" size="sm" onClick={() => patch({ category: undefined, status: undefined })}>
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
          variant="error"
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
          <MapView complaints={visible} userLocation={userLocation} />
          <div className="absolute right-3 top-3 z-[500] rounded-md border bg-card/95 px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <Filter className="size-3.5 text-primary" aria-hidden="true" />
              {visible.length} of {data.length} reports shown
            </span>
          </div>
        </div>
      )}
    </div>
  );
}