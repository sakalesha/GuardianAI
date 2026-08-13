import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, LocateFixed, MapPin, Send } from "lucide-react";
import { useCreateComplaint } from "@/hooks/useComplaints";
import { useGeolocation } from "@/hooks/useGeolocation";
import { normalizeError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { PhotoCapture } from "@/features/report/PhotoCapture";
import { COMPLAINT_CATEGORIES, type ComplaintCategory } from "@/types/complaint";
import type { CreateComplaintPayload } from "@/types/complaint";
import { categoryMeta, slaHoursFor } from "@/lib/categories";
import { formatCoordinates } from "@/lib/geo";
import { formatDateTime } from "@/lib/dates";

function parseCoordinate(raw: string, min: number, max: number): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

export function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateComplaint();
  const { status, coords, accuracy, error, locate } = useGeolocation();

  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords) {
      setLatInput(String(coords.latitude));
      setLngInput(String(coords.longitude));
    }
  }, [coords]);

  const lat = parseCoordinate(latInput, -90, 90);
  const lng = parseCoordinate(lngInput, -180, 180);
  const coordsValid = lat !== null && lng !== null;

  const slaDeadline = category
    ? new Date(Date.now() + slaHoursFor(category) * 3_600_000).toISOString()
    : null;
  const cat = category ? categoryMeta(category) : null;
  const CatIcon = cat?.icon;

  const handleSubmit = async () => {
    const nextErrors: string[] = [];
    if (!category) nextErrors.push("Choose a category.");
    if (!photo) nextErrors.push("Add a photo of the issue.");
    if (!coordsValid) nextErrors.push("Enter valid coordinates for the location.");
    setErrors(nextErrors);
    if (nextErrors.length > 0) {
      toast.error(nextErrors.join(" "));
      return;
    }

    const payload: CreateComplaintPayload = {
      category: category as ComplaintCategory,
      description: description.trim() || undefined,
      imageUrl: photo as string,
      latitude: lat as number,
      longitude: lng as number,
      slaDeadline: slaDeadline as string,
      userId: user!.uid,
    };

    try {
      const created = await createMutation.mutateAsync(payload);
      if (created.status === "SUSPICIOUS_CONTENT") {
        toast.warning("Report submitted, but no civic issue was detected — it was flagged for review.");
      } else {
        toast.success("Report submitted");
      }
      navigate(`/reports/${created.id}`, { replace: true });
    } catch (err) {
      toast.error(normalizeError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Report an issue" description="Capture evidence and location so it can be verified and actioned.">
        <Button asChild variant="ghost" size="sm">
          <Link to="/reports">
            <ArrowLeft className="mr-1" />
            Back to reports
          </Link>
        </Button>
      </PageHeader>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>{errors.join(" ")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evidence</CardTitle>
            <CardDescription>A clear photo helps verification and the AI audit.</CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoCapture
              value={photo}
              onChange={setPhoto}
              label="Issue evidence"
              hint="Photos should be taken at the site. Gallery uploads without location metadata may fail verification."
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Category</CardTitle>
              <CardDescription>What kind of issue is this?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={category ?? undefined}
                onValueChange={(v) => setCategory(v as ComplaintCategory)}
              >
                <SelectTrigger className="w-full" aria-label="Issue category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((c) => {
                    const meta = categoryMeta(c);
                    const Icon = meta.icon;
                    return (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                          {c}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {slaDeadline && (
                <p className="text-xs text-muted-foreground">
                  SLA deadline for {category}: <span className="font-medium text-foreground">{formatDateTime(slaDeadline)}</span> (within {slaHoursFor(category as ComplaintCategory)}h)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
              <CardDescription>Optional — add context that helps the team.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="e.g. Large pothole near the bus stop that damaged my car."
                rows={4}
                aria-label="Issue description"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/500</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Location
          </CardTitle>
          <CardDescription>
            GPS is recommended for verification. You can also enter coordinates manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              {status === "locating" && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
              <span className="text-muted-foreground">
                {status === "success" && coords
                  ? `Acquired ${formatCoordinates(coords.latitude, coords.longitude)}${accuracy != null ? ` (±${Math.round(accuracy)} m)` : ""}`
                  : status === "error"
                    ? "Location unavailable — enter coordinates manually."
                    : status === "locating"
                      ? "Detecting your location…"
                      : "Location not yet acquired."}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={locate}
              disabled={status === "locating"}
            >
              <LocateFixed className="mr-1" aria-hidden="true" />
              {status === "locating" ? "Locating…" : "Use my location"}
            </Button>
          </div>

          {status === "error" && error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                inputMode="decimal"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="-90 to 90"
                aria-invalid={latInput !== "" && lat === null}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                inputMode="decimal"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="-180 to 180"
                aria-invalid={lngInput !== "" && lng === null}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              {photo ? (
                <img src={photo} alt="Evidence preview" className="size-12 rounded-md border object-cover" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
                  <MapPin className="size-5" aria-hidden="true" />
                </div>
              )}
              <div className="space-y-0.5">
                <p className="flex items-center gap-1.5 font-medium">
                  {CatIcon && <CatIcon className="size-4 text-primary" aria-hidden="true" />}
                  {cat ? `${cat.label} issue` : "Uncategorized"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {coordsValid
                    ? formatCoordinates(lat as number, lng as number)
                    : "No valid coordinates"}
                  {slaDeadline ? ` · deadline ${formatDateTime(slaDeadline)}` : ""}
                </p>
              </div>
            </div>
            <Button onClick={() => void handleSubmit()} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 animate-spin" aria-hidden="true" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="mr-1" aria-hidden="true" />
                  Submit report
                </>
              )}
            </Button>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Submitted reports are checked for a matching civic issue by the AI auditor. Reports without a
            detected issue are flagged for human review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}