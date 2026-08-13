import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface BrandProps {
  compact?: boolean;
  className?: string;
}

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Civic<span className="text-primary">Proof</span>
        </span>
      )}
    </Link>
  );
}