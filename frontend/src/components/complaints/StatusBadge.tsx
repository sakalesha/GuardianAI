import { statusBadgeClasses, statusMeta, getCitizenLabel, getCitizenIcon } from "@/lib/status";
import { cn } from "@/lib/cn";
import type { ComplaintStatus } from "@/types/complaint";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
  variant?: "citizen" | "admin";
}

export function StatusBadge({ status, className, variant = "citizen" }: StatusBadgeProps) {
  const meta = statusMeta(status);
  const isCitizen = variant === "citizen";
  const label = isCitizen ? getCitizenLabel(status) : meta.label;
  const Icon = isCitizen ? getCitizenIcon(status) : meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        statusBadgeClasses(status),
        className,
      )}
      title={meta.description}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}