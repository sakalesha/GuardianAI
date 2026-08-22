import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { motion } from "motion/react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  variant?: "default" | "compact" | "hero";
  className?: string;
  actionAlign?: "start" | "end" | "center";
  showBreadcrumbs?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  breadcrumbs,
  variant = "default",
  className,
  actionAlign = "end",
  showBreadcrumbs = true,
}: PageHeaderProps) {
  const location = useLocation();

  const computedBreadcrumbs = breadcrumbs ?? (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return [
      { label: "Home", href: "/", current: segments.length === 0 },
      ...segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segment
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return { label, href, current: index === segments.length - 1 };
      }),
    ];
  })();

  const hasBreadcrumbs = computedBreadcrumbs.length > 1;
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4",
      isHero && "gap-6 pb-2",
      isCompact && "gap-2",
      className,
    )}>
      <div className="space-y-1.5 min-w-0">
        {hasBreadcrumbs && showBreadcrumbs && !isCompact && !isHero && (
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {computedBreadcrumbs.map((item, index) => (
              <span
                key={item.href ?? item.label}
                className="inline-flex items-center gap-1.5"
              >
                {index > 0 && (
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                )}
                {item.current ? (
                  <span className="font-medium text-foreground">{item.label}</span>
                ) : item.href ? (
                  <Link to={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-baseline flex-wrap gap-2">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "font-display font-semibold tracking-tight truncate",
              isHero ? "text-3xl lg:text-4xl" : isCompact ? "text-xl" : "text-2xl",
            )}
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={cn(
                "text-muted-foreground truncate",
                isHero ? "text-base lg:text-lg" : isCompact ? "text-xs" : "text-sm",
              )}
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>

      {children && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "flex flex-wrap items-center gap-2 shrink-0",
            actionAlign === "start" && "ml-auto",
            actionAlign === "center" && "mx-auto",
            actionAlign === "end" && "ms-auto",
          )}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export function PageHeaderActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}