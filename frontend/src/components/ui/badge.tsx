import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors [&>svg]:size-3 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        primary: "border-primary/30 bg-primary/10 text-primary",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-info/30 bg-info/10 text-info",
        neutral: "border-white/[0.08] bg-white/[0.04] text-foreground",
        subtle: "border-transparent bg-white/[0.03] text-muted-foreground",
        brand: "border-role-accent-border bg-role-accent-subtle text-role-accent",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px] gap-1",
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        lg: "px-3 py-1 text-sm gap-2",
      },
      variant: {
        solid: "",
        outline: "bg-transparent",
        soft: "",
      },
    },
    compoundVariants: [
      {
        tone: "primary",
        variant: "solid",
        className: "bg-primary text-primary-foreground border-transparent",
      },
      {
        tone: "success",
        variant: "solid",
        className: "bg-success text-success-foreground border-transparent",
      },
      {
        tone: "warning",
        variant: "solid",
        className: "bg-warning text-warning-foreground border-transparent",
      },
      {
        tone: "destructive",
        variant: "solid",
        className: "bg-destructive text-destructive-foreground border-transparent",
      },
      {
        tone: "info",
        variant: "solid",
        className: "bg-info text-info-foreground border-transparent",
      },
      {
        tone: "neutral",
        variant: "solid",
        className: "bg-muted text-foreground border-transparent",
      },
      {
        tone: "brand",
        variant: "solid",
        className: "bg-role-accent text-role-accent-foreground border-transparent",
      },
    ],
    defaultVariants: {
      tone: "neutral",
      size: "default",
      variant: "soft",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, variant, icon, dot, dotColor, asChild = false, children, ...props }, ref) => {
    const Component = asChild ? "span" : "span";
    const dotStyle = dot ? { backgroundColor: dotColor || "currentColor" } : undefined;

    return (
      <Component
        ref={ref}
        className={cn(badgeVariants({ tone, size, variant, className }))}
        {...props}
      >
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        {dot && <span className="size-1.5 rounded-full shrink-0" style={dotStyle} aria-hidden="true" />}
        {children}
      </Component>
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };

export type { VariantProps } from "class-variance-authority";