import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  NoReportsIllustration,
  NoJobsIllustration,
  NoReviewsIllustration,
  NoResultsIllustration,
  OfflineIllustration,
  ErrorIllustration,
  BrandIllustration,
} from "@/components/ui/illustration";

export type EmptyStateVariant =
  | "no-reports"
  | "no-jobs"
  | "no-reviews"
  | "no-results"
  | "offline"
  | "error"
  | "brand"
  | "default";

const variantConfig: Record<EmptyStateVariant, { Illustration: React.FC<{ className?: string; width?: number; height?: number }>; color: string }> = {
  "no-reports": { Illustration: NoReportsIllustration, color: "text-primary" },
  "no-jobs": { Illustration: NoJobsIllustration, color: "text-warning" },
  "no-reviews": { Illustration: NoReviewsIllustration, color: "text-info" },
  "no-results": { Illustration: NoResultsIllustration, color: "text-muted-foreground" },
  offline: { Illustration: OfflineIllustration, color: "text-destructive" },
  error: { Illustration: ErrorIllustration, color: "text-destructive" },
  brand: { Illustration: BrandIllustration, color: "text-primary" },
  default: { Illustration: NoReportsIllustration, color: "text-muted-foreground" },
};

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon; // Deprecated - use variant instead
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  illustrationSize?: number;
}

export function EmptyState({
  variant = "default",
  icon: DeprecatedIcon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustrationSize = 160,
}: EmptyStateProps) {
  const { Illustration, color } = variantConfig[variant];
  const useIllustration = variant !== "default" || !DeprecatedIcon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center",
        className,
      )}
    >
      {useIllustration ? (
        <div className={cn("flex items-center justify-center", color)}>
          <Illustration className="w-[160px] h-[160px]" width={illustrationSize} height={illustrationSize} />
        </div>
      ) : (
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <DeprecatedIcon className="size-6" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function EmptyStateWithIllustration({
  Illustration,
  color = "text-muted-foreground",
  title,
  description,
  action,
  className,
  illustrationSize = 160,
}: {
  Illustration: React.FC<{ className?: string; width?: number; height?: number }>;
  color?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  illustrationSize?: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center",
        className,
      )}
    >
      <div className={cn("flex items-center justify-center", color)}>
        <Illustration className="w-[160px] h-[160px]" width={illustrationSize} height={illustrationSize} />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}