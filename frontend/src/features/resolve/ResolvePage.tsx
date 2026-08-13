import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Send,
  XCircle,
} from "lucide-react";
import { useComplaint, useUpdateComplaintStatus } from "@/hooks/useComplaints";
import { useGeolocation } from "@/hooks/useGeolocation";
import { normalizeError } from "@/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/complaints/EmptyState";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { ComplaintImage } from "@/components/complaints/ComplaintImage";
import { PhotoCapture } from "@/features/report/PhotoCapture";
import { isActionable } from "@/lib/filters";
import { categoryMeta } from "@/lib/categories";
import { formatCoordinates, formatDistance, haversineMeters } from "@/lib/geo";
import { relativeTime } from "@/lib/dates";
import type { UpdateStatusPayload } from "@/types/complaint";

const SITE_RADIUS_METERS = 500;

function ResolveSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80 w-full" />
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function ResolvePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: complaint, isLoading, isError, error } = useComplaint(id);
  const updateMutation = useUpdateComplaintStatus();
  const { status, coords, error: geoError, locate } = useGeolocation();
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <ResolveSkeleton />
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/reports">
            <ArrowLeft />
            Back to reports
          </Link>
        </Button>
        <EmptyState
          icon={XCircle}
          title="Report not found"
          description={isError ? normalizeError(error).message : "This report may have been removed."}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/reports">Browse reports</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!isActionable(complaint.status)) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to={`/reports/${complaint.id}`}>
            <ArrowLeft />
            Back to report
          </Link>
        </Button>
        <EmptyState
          icon={CheckCircle2}
          title="Nothing to resolve"
          description={`This report is currently ${complaint.status.replaceAll("_", " ").toLowerCase()} and is not awaiting resolution.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link to={`/reports/${complaint.id}`}>View report</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  const distance = coords
    ? haversineMeters(
        complaint.latitude,
        complaint.longitude,
        coords.latitude,
        coords.longitude,
      )
    : null;
  const withinRange = distance !== null && distance <= SITE_RADIUS_METERS;

  const handleSubmit = async () => {
    if (!photo || !coords || distance === null || !withinRange) return;
    const payload: UpdateStatusPayload = {
      status: "RESOLVED",
      resolutionImageUrl: photo,
      resolutionLatitude: coords.latitude,
      resolutionLongitude: coords.longitude,
    };
    try {
      const updated = await updateMutation.mutateAsync({ id: complaint.id, payload });
      const msg =
        updated.status === "RESOLVED"
          ? "Resolution verified — issue marked resolved."
          : updated.status === "VERIFIED_TENTATIVE"
            ? "Resolution tentatively verified — pending review."
            : updated.status === "NEEDS_HUMAN_REVIEW"
              ? "Resolution flagged for human review."
              : `Resolution recorded (${updated.status}).`;
      toast.success(msg);
      navigate(`/reports/${complaint.id}`, { replace: true });
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Resolve report" description="Submit on-site evidence to verify the issue is fixed.">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/reports/${complaint.id}`}>
            <ArrowLeft className="mr-1" />
            Back to report
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CatIcon className="size-4 text-primary" aria-hidden="true" />
              Original complaint
            </CardTitle>
            <StatusBadge status={complaint.status} />
          </CardHeader>
          <CardContent className="space-y-3">
            <ComplaintImage
              src={complaint.imageUrl}
              alt={`${complaint.category} complaint evidence`}
              width={640}
              className="aspect-[16/10] rounded-md"
            />
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {complaint.description || "No description provided."}
            </p>
            <dl className="divide-y divide-border text-sm">
              <div className="flex items-start justify-between gap-3 py-1.5">
                <dt className="text-muted-foreground">Reported</dt>
                <dd className="font-medium">{relativeTime(complaint.timestamp)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-1.5">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium">
                  {formatCoordinates(complaint.latitude, complaint.longitude)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                On-site check
              </CardTitle>
              <CardDescription>
                You must be within {SITE_RADIUS_METERS} m of the report location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  {status === "locating" && (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                  )}
                  {distance !== null ? (
                    <>
                      {withinRange ? (
                        <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                      ) : (
                        <XCircle className="size-4 text-destructive" aria-hidden="true" />
                      )}
                      <span className={withinRange ? "text-success" : "text-destructive"}>
                        {formatDistance(distance)} from the site
                        {withinRange ? " — at site" : ` — over ${SITE_RADIUS_METERS} m`}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {status === "error" ? "Location unavailable." : "Waiting for location…"}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={locate}
                  disabled={status === "locating"}
                >
                  <Crosshair className="mr-1" aria-hidden="true" />
                  {status === "locating" ? "Locating…" : "Refresh location"}
                </Button>
              </div>

              {status === "error" && geoError && (
                <Alert variant="destructive">
                  <AlertDescription>{geoError}</AlertDescription>
                </Alert>
              )}

              {distance !== null && !withinRange && (
                <Alert variant="warning">
                  <AlertDescription>
                    Submit is blocked because you are outside the {SITE_RADIUS_METERS} m radius. The
                    system will reject off-site submissions automatically.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resolution evidence</CardTitle>
              <CardDescription>Take a photo showing the issue has been fixed.</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoCapture
                value={photo}
                onChange={setPhoto}
                label="Resolution evidence"
                hint="The after-photo is compared against the original by the AI auditor."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="size-4 text-primary" aria-hidden="true" />
              {coords
                ? `Your location: ${formatCoordinates(coords.latitude, coords.longitude)}`
                : "No live location"}
            </div>
            <Button
              onClick={() => void handleSubmit()}
              disabled={
                !photo ||
                !coords ||
                distance === null ||
                !withinRange ||
                updateMutation.isPending
              }
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                <>
                  <Send className="mr-1" aria-hidden="true" />
                  Submit resolution
                </>
              )}
            </Button>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            The system checks your live location against the report (within {SITE_RADIUS_METERS} m) and
            runs an AI before/after comparison. Off-site submissions are automatically rejected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}