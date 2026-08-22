import { type ElementType } from "react";
import { cn } from "@/lib/cn";

/** Frosted white-to-transparent gradient text for display headlines. */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("text-gradient", className)}>{children}</Tag>
  );
}

/** Indigo shimmering accent text — used for key phrases inside headlines. */
export function AccentText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-gradient-accent motion-safe:animate-[shimmer-x_3s_linear_infinite]",
        className,
      )}
    >
      {children}
    </span>
  );
}
