import { Badge } from "@/components/ui/badge";
import { slaState } from "@/lib/dates";
import { cn } from "@/lib/cn";

interface SlaBadgeProps {
  deadline: string;
  className?: string;
}

export function SlaBadge({ deadline, className }: SlaBadgeProps) {
  const state = slaState(deadline);
  const variant = state.overdue ? "destructive" : state.urgent ? "warning" : "neutral";
  return (
    <Badge variant={variant} className={cn(className)}>
      {state.label}
    </Badge>
  );
}