import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";
import { ComplaintImage } from "@/components/complaints/ComplaintImage";
import { Badge } from "@/components/ui/badge";
import { categoryMeta } from "@/lib/categories";
import { relativeTime, slaState } from "@/lib/dates";
import { formatCoordinates } from "@/lib/geo";
import type { Complaint } from "@/types/complaint";
import { cn } from "@/lib/cn";

export type ReportCardDensity = "comfortable" | "compact";

interface ReportCardProps {
  complaint: Complaint;
  showSla?: boolean;
  density?: ReportCardDensity;
  onDensityChange?: (density: ReportCardDensity) => void;
  variant?: "default" | "interactive";
}

type BadgeSize = "sm" | "default" | "lg";

const DENSITY_STYLES: Record<ReportCardDensity, {
  container: string;
  padding: string;
  gap: string;
  titleGap: string;
  descClamp: string;
  metaGap: string;
  iconSize: string;
  badgeSize: BadgeSize;
}> = {
  comfortable: {
    container: "aspect-[16/10]",
    padding: "p-4",
    gap: "gap-3",
    titleGap: "gap-2",
    descClamp: "line-clamp-2",
    metaGap: "gap-2",
    iconSize: "size-4",
    badgeSize: "default",
  },
  compact: {
    container: "aspect-[4/3]",
    padding: "p-3",
    gap: "gap-2",
    titleGap: "gap-1.5",
    descClamp: "line-clamp-1",
    metaGap: "gap-1.5",
    iconSize: "size-3.5",
    badgeSize: "sm",
  },
};

export function ReportCard({
  complaint,
  showSla = true,
  density = "comfortable",
  variant = "interactive",
}: ReportCardProps) {
  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  const resolved =
    complaint.status === "RESOLVED" || complaint.status === "VERIFIED_RESOLUTION";
  const sla = slaState(complaint.slaDeadline);
  const styles = DENSITY_STYLES[density];

  const statusTone = {
    PENDING: "primary",
    RESOLVED: "success",
    VERIFIED_RESOLUTION: "success",
    VERIFIED_TENTATIVE: "info",
    REOPENED: "warning",
    NEEDS_HUMAN_REVIEW: "warning",
    REJECTED_GPS: "destructive",
    REJECTED_ML: "destructive",
    REJECTED_MANUAL: "destructive",
    DISMISSED: "neutral",
    SUSPICIOUS: "destructive",
    SUSPICIOUS_CONTENT: "destructive",
  } as const;

  const statusToneValue = statusTone[complaint.status as keyof typeof statusTone] || "neutral";

  return (
    <Link
      to={`/reports/${complaint.id}`}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        variant === "interactive" && "transition-all duration-normal hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className={cn("relative overflow-hidden", styles.container)}>
        <ComplaintImage
          src={complaint.imageUrl}
          alt={`${complaint.category} report`}
          width={640}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex items-center gap-1">
          <Badge
            tone={statusToneValue}
            variant="solid"
            size={styles.badgeSize}
            className="shadow-md"
            dot
          >
            {cat.label}
          </Badge>
        </div>

        {showSla && !resolved && (
          <div className="absolute right-2 top-2">
            <Badge
              tone={sla.overdue ? "destructive" : sla.urgent ? "warning" : "success"}
              variant="solid"
              size={styles.badgeSize}
              className="shadow-md"
              dot
            >
              {sla.label}
            </Badge>
          </div>
        )}

        {resolved && (
          <div className="absolute right-2 top-2">
            <Badge tone="success" variant="solid" size={styles.badgeSize} className="shadow-md" dot>
              Resolved
            </Badge>
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col", styles.padding, styles.gap)}>
        <div className={cn("flex items-start justify-between", styles.titleGap)}>
          <div className={cn("flex items-center", styles.titleGap)}>
            <CatIcon className={cn("shrink-0 text-muted-foreground", styles.iconSize)} aria-hidden="true" />
            <span className="font-medium text-sm truncate">{cat.label}</span>
          </div>
          <ArrowUpRight
            className={cn("shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", styles.iconSize)}
            aria-hidden="true"
          />
        </div>

        <p className={cn("text-sm text-muted-foreground", styles.descClamp)}>
          {complaint.description || "No description provided."}
        </p>

        <div className={cn("mt-auto flex items-center justify-between text-xs text-muted-foreground", styles.metaGap)}>
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className={cn("shrink-0", styles.iconSize)} aria-hidden="true" />
            <span className="truncate">{formatCoordinates(complaint.latitude, complaint.longitude)}</span>
          </span>
          <span className={cn("shrink-0 inline-flex items-center gap-1", styles.iconSize)}>
            <Clock className="size-3" aria-hidden="true" />
            {relativeTime(complaint.timestamp)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ReportCardSkeleton({ density = "comfortable" }: { density?: ReportCardDensity }) {
  const styles = DENSITY_STYLES[density];
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className={cn("bg-muted/50", styles.container)} />
      <div className={cn("flex flex-1 flex-col", styles.padding, styles.gap)}>
        <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
        <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted/50 animate-pulse rounded" />
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="h-3 w-24 bg-muted/50 animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted/50 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function ReportCardDensityToggle({
  density,
  onChange,
}: {
  density: ReportCardDensity;
  onChange: (density: ReportCardDensity) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-md" role="group" aria-label="Card density">
      <button
        type="button"
        onClick={() => onChange("comfortable")}
        className={cn(
          "px-2 py-1 rounded text-xs font-medium transition-colors",
          density === "comfortable" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={density === "comfortable"}
      >
        Comfortable
      </button>
      <button
        type="button"
        onClick={() => onChange("compact")}
        className={cn(
          "px-2 py-1 rounded text-xs font-medium transition-colors",
          density === "compact" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={density === "compact"}
      >
        Compact
      </button>
    </div>
  );
}