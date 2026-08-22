import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";
import { normalizeError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/complaints/EmptyState";
import { ReportCard } from "@/features/reports/ReportCard";
import { sortComplaints } from "@/lib/filters";
import { isReviewable } from "@/lib/review";

type ReviewTab = "needs-review" | "all";

export function AuthorityPage() {
  const { data = [], isLoading, isError, error, refetch } = useComplaints();
  const [params, setParams] = useSearchParams();

  const tab: ReviewTab = params.get("tab") === "all" ? "all" : "needs-review";

  const reviewCount = useMemo(
    () => data.filter((c) => isReviewable(c.status)).length,
    [data],
  );

  const visible = useMemo(() => {
    const scoped = tab === "all" ? data : data.filter((c) => isReviewable(c.status));
    return sortComplaints(scoped, "urgency");
  }, [data, tab]);

  const setTab = (next: string) => {
    const value: ReviewTab = next === "all" ? "all" : "needs-review";
    setParams(value === "all" ? { tab: "all" } : {}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authority"
        description="Review flagged reports and monitor platform activity."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="needs-review">
            Needs review ({reviewCount})
          </TabsTrigger>
          <TabsTrigger value="all">All reports</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
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
      ) : visible.length === 0 ? (
        <EmptyState
          variant="no-reviews"
          title={tab === "all" ? "No reports yet" : "Nothing needs review"}
          description={
            tab === "all"
              ? "Community reports will appear here as citizens file them."
              : "All resolutions and flagged reports have been handled."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <ReportCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}