import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "default" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "default", children, ...props }, ref) => {
    const baseStyles =
      "relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-card-foreground shadow-[0_0_0_1px_rgb(255_255_255/0.04),0_2px_20px_rgb(0_0_0/0.4)] backdrop-blur-xl";
    const variantStyles: Record<string, string> = {
      default: "",
      glass: "bg-white/[0.03]",
      interactive:
        "transition-all duration-200 ease-out hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_40px_rgb(0_0_0/0.5),0_0_80px_rgb(94_106_210/0.08)] cursor-pointer",
      elevated: "shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_40px_rgb(0_0_0/0.5)]",
      outlined: "border-white/[0.06] shadow-none bg-transparent backdrop-blur-none",
    };
    const paddingStyles: Record<string, string> = {
      none: "",
      sm: "p-3",
      default: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "default" | "lg";
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        padding === "none" ? "" : padding === "sm" ? "p-3" : padding === "default" ? "p-4" : "p-6",
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: "sm" | "default" | "lg";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "default", ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        size === "sm" ? "text-sm" : size === "default" ? "text-base" : "text-lg",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "default" | "lg";
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        padding === "none" ? "pt-0" : padding === "sm" ? "p-3 pt-0" : padding === "default" ? "p-4 pt-0" : "p-6 pt-0",
        className,
      )}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "default" | "lg";
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        padding === "none" ? "pt-0" : padding === "sm" ? "p-3 pt-0" : padding === "default" ? "p-4 pt-0" : "p-6 pt-0",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps };