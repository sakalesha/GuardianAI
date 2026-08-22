import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export type BrandVariant = "full" | "icon" | "wordmark";

interface BrandProps {
  variant?: BrandVariant;
  className?: string;
  href?: string;
}

export function Brand({ variant = "full", className, href = "/" }: BrandProps) {
  const icon = (
    <span className="flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow" aria-hidden="true">
      <ShieldCheck className="size-5" />
    </span>
  );

  const wordmark = (
    <span className="font-display font-semibold tracking-tight text-foreground">
      Guardian<span className="text-primary">AI</span>
    </span>
  );

  return (
    <Link to={href} className={cn("flex items-center gap-2.5", className)}>
      {variant !== "wordmark" && (
        <span className={cn(
          "flex items-center justify-center transition-colors",
          variant === "icon" ? "size-10" : "size-9",
        )}>
          {icon}
        </span>
      )}
      {(variant === "full" || variant === "wordmark") && wordmark}
    </Link>
  );
}

export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <ShieldCheck className={cn("size-5", size <= 24 && "size-4")} />
    </span>
  );
}