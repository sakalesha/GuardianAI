import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Diameter of the cursor-following glow in px. */
  spotlightSize?: number;
}

/**
 * Card surface that renders a soft radial glow tracking the cursor.
 * Pair with the existing glass/dark surfaces for the "magical" interaction feel.
 * Degrades to a static card when the user prefers reduced motion.
 */
export function SpotlightCard({
  children,
  className,
  spotlightSize = 320,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn("group/spotlight relative overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spotlight-size, 320px) circle at var(--mx, 50%) var(--my, 50%), rgb(94 106 210 / 0.12), transparent 70%)",
          ["--spotlight-size" as string]: `${spotlightSize}px`,
        }}
      />
      {children}
    </div>
  );
}
