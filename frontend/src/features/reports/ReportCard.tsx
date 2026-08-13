import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ComplaintImage } from "@/components/complaints/ComplaintImage";
import { SlaBadge } from "@/components/complaints/SlaBadge";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { categoryMeta } from "@/lib/categories";
import { relativeTime } from "@/lib/dates";
import { formatCoordinates } from "@/lib/geo";
import type { Complaint } from "@/types/complaint";

interface ReportCardProps {
  complaint: Complaint;
  showSla?: boolean;
}

export function ReportCard({ complaint, showSla = true }: ReportCardProps) {
  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  const resolved =
    complaint.status === "RESOLVED" || complaint.status === "VERIFIED_RESOLUTION";

  return (
    <Link
      to={`/reports/${complaint.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10]">
        <ComplaintImage
          src={complaint.imageUrl}
          alt={`${complaint.category} report`}
          width={640}
          className="absolute inset-0"
        />
        <div className="absolute left-2 top-2">
          <StatusBadge status={complaint.status} className="border bg-card/95 backdrop-blur" />
        </div>
        {showSla && !resolved && (
          <div className="absolute right-2 top-2">
            <SlaBadge deadline={complaint.slaDeadline} className="border bg-card/95 backdrop-blur" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <CatIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {cat.label}
          </div>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {complaint.description || "No description provided."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {formatCoordinates(complaint.latitude, complaint.longitude)}
            </span>
          </span>
          <span className="shrink-0">{relativeTime(complaint.timestamp)}</span>
        </div>
      </div>
    </Link>
  );
}