import { statusBadgeClasses, statusMeta } from "@/lib/status";
import { cn } from "@/lib/cn";
import type { ComplaintStatus } from "@/types/complaint";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
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
      {meta.label}
    </span>
  );
}