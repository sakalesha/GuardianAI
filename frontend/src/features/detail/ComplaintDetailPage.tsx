import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Gauge,
  MapPin,
  Sparkles,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  useComplaint,
  useDeleteComplaint,
  useUpdateComplaintStatus,
} from "@/hooks/useComplaints";
import { normalizeError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { SlaBadge } from "@/components/complaints/SlaBadge";
import { ComplaintImage } from "@/components/complaints/ComplaintImage";
import { EmptyState } from "@/components/complaints/EmptyState";
import { categoryMeta } from "@/lib/categories";
import { formatDateTime, relativeTime } from "@/lib/dates";
import { formatCoordinates, formatDistance } from "@/lib/geo";
import { isActionable } from "@/lib/filters";
import { statusColor, statusMeta } from "@/lib/status";
import { authorityActionsFor, authorityHistoryEntry, type AuthorityAction } from "@/lib/review";
import { MiniMap } from "@/features/map/MiniMap";
import type { Complaint, Detection } from "@/types/complaint";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function CopyIdButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Copy report ID"
      onClick={() => {
        void navigator.clipboard?.writeText(id);
        toast.success("Report ID copied");
      }}
    >
      <Copy className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function DetectionRow({ detection }: { detection: Detection }) {
  const confidence = Math.round(detection.confidence * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{detection.label}</span>
        <span className="text-muted-foreground">{confidence}%</span>
      </div>
      <Progress value={confidence} className="h-1.5" />
    </div>
  );
}

function MlSection({ complaint }: { complaint: Complaint }) {
  const hasValid = complaint.mlMetadata.hasValidIssue;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        <CardTitle className="text-sm">AI verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {hasValid ? (
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          ) : (
            <XCircle className="size-4 text-destructive" aria-hidden="true" />
          )}
          <span className="font-medium">{hasValid ? "Valid issue detected" : "No valid issue detected"}</span>
        </div>
        {complaint.mlMetadata.detectedIssues.length > 0 ? (
          <div className="space-y-2.5">
            {complaint.mlMetadata.detectedIssues.map((d, i) => (
              <DetectionRow key={`${d.label}-${i}`} detection={d} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No objects were detected in the submitted image.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function VerificationSection({ complaint }: { complaint: Complaint }) {
  const v = complaint.verificationData;
  const score = complaint.verificationScore;
  const gpsPass = v.distanceMeters <= 500;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Gauge className="size-4 text-primary" aria-hidden="true" />
        <CardTitle className="text-sm">Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score != null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {complaint.verificationLabel ?? "Verification score"}
              </span>
              <span className="text-muted-foreground">{Math.round(score)}%</span>
            </div>
            <Progress value={Math.round(score)} />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">GPS match</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="size-3.5" aria-hidden="true" />
              {formatDistance(v.distanceMeters)}
              <span className={gpsPass ? "text-success" : "text-destructive"}>
                {gpsPass ? "within 500 m" : "over 500 m"}
              </span>
            </span>
          </div>
          <DetailRow label="Temporal match">
            {v.timeDifferenceHours < 1
              ? "<1 h"
              : `${Math.round(v.timeDifferenceHours * 10) / 10} h`}
          </DetailRow>
        </div>
        {v.reason && <p className="text-sm text-muted-foreground">{v.reason}</p>}
      </CardContent>
    </Card>
  );
}

function Timeline({ complaint }: { complaint: Complaint }) {
  const entries = [...complaint.history].reverse();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Audit trail</CardTitle>
        <CardDescription>Every status change is recorded on the blockchain-ready log.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0">
          {entries.map((entry, i) => (
            <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
              {i < entries.length - 1 && (
                <span
                  className="absolute left-[7px] top-4 h-full w-px bg-border"
                  aria-hidden="true"
                />
              )}
              <span
                className="mt-1.5 size-3.5 shrink-0 rounded-full border-2 bg-background"
                style={{ borderColor: statusColor(entry.status) }}
                aria-hidden="true"
              />
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(entry.timestamp)}
                  </span>
                </div>
                {entry.message && <p className="text-sm text-muted-foreground">{entry.message}</p>}
                {entry.user && (
                  <p className="text-xs text-muted-foreground">by {entry.user}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export function ComplaintDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: complaint, isLoading, isError, error } = useComplaint(id);
  const deleteMutation = useDeleteComplaint();
  const updateStatus = useUpdateComplaintStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingReview, setPendingReview] = useState<AuthorityAction | null>(null);

  const isOwner = user?.role === "CITIZEN" && complaint?.userId === user.uid;
  const canDelete =
    isOwner &&
    complaint &&
    complaint.status !== "RESOLVED" &&
    complaint.status !== "VERIFIED_RESOLUTION";
  const canResolve =
    user?.role === "WORKER" && !!complaint && isActionable(complaint.status);
  const reviewActions =
    user?.role === "AUTHORITY" && complaint ? authorityActionsFor(complaint.status) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <DetailSkeleton />
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

  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  const resolved =
    complaint.status === "RESOLVED" || complaint.status === "VERIFIED_RESOLUTION";

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: complaint.id, userId: user!.uid });
      toast.success("Report deleted");
      navigate("/reports", { replace: true });
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  const handleReview = async (action: AuthorityAction) => {
    try {
      const updated = await updateStatus.mutateAsync({
        id: complaint.id,
        payload: {
          status: action.targetStatus,
          history: [...complaint.history, authorityHistoryEntry(action)],
        },
      });
      toast.success(`Report marked as ${statusMeta(updated.status).label}`);
      setPendingReview(null);
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/reports">
          <ArrowLeft />
          Back to reports
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            <span className="inline-flex items-center gap-2">
              <CatIcon className="size-6 text-primary" aria-hidden="true" />
              {cat.label}
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {complaint.id}
            </code>
            <CopyIdButton id={complaint.id} />
            <StatusBadge status={complaint.status} />
            {!resolved && <SlaBadge deadline={complaint.slaDeadline} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canResolve && (
            <Button asChild>
              <Link to={`/reports/${complaint.id}/resolve`}>
                <Wrench className="mr-1" />
                Resolve issue
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-1" />
              Delete report
            </Button>
          )}
          {reviewActions.map((action) => (
            <Button
              key={action.key}
              variant={
                action.tone === "destructive"
                  ? "destructive"
                  : action.tone === "warning"
                    ? "secondary"
                    : "default"
              }
              disabled={updateStatus.isPending}
              onClick={() =>
                action.confirm ? setPendingReview(action) : void handleReview(action)
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <ComplaintImage
                src={complaint.imageUrl}
                alt={`${complaint.category} report evidence`}
                className="aspect-[16/9] rounded-md"
              />
            </CardContent>
          </Card>

          {complaint.resolutionImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  Resolution evidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplaintImage
                  src={complaint.resolutionImageUrl}
                  alt="Resolution evidence"
                  className="aspect-[16/9] rounded-md"
                />
                {complaint.resolutionTimestamp && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Resolved {formatDateTime(complaint.resolutionTimestamp)}
                    {complaint.resolvedBy ? ` by ${complaint.resolvedBy}` : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {complaint.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Timeline complaint={complaint} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MiniMap
                key={complaint.id}
                lat={complaint.latitude}
                lng={complaint.longitude}
                color={statusColor(complaint.status)}
              />
              <dl className="divide-y divide-border">
                <DetailRow label="Coordinates">
                  {formatCoordinates(complaint.latitude, complaint.longitude)}
                </DetailRow>
                <DetailRow label="Reported"> {relativeTime(complaint.timestamp)}</DetailRow>
                <DetailRow label="Reported by">
                  <span className="font-mono text-xs">{complaint.userId}</span>
                </DetailRow>
                <DetailRow label="SLA deadline">
                  {resolved ? "—" : formatDateTime(complaint.slaDeadline)}
                </DetailRow>
              </dl>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRight className="mr-1" />
                  Open in Google Maps
                </a>
              </Button>
            </CardContent>
          </Card>

          <VerificationSection complaint={complaint} />
          <MlSection complaint={complaint} />
        </div>
      </div>

      <Separator />

      <Dialog open={pendingReview !== null} onOpenChange={(open) => !open && setPendingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingReview?.label}</DialogTitle>
            <DialogDescription>{pendingReview?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingReview(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingReview?.tone === "destructive" ? "destructive" : "default"}
              disabled={updateStatus.isPending}
              onClick={() => pendingReview && void handleReview(pendingReview)}
            >
              {updateStatus.isPending ? "Updating…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this report?</DialogTitle>
            <DialogDescription>
              This permanently removes the report and its audit trail. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}