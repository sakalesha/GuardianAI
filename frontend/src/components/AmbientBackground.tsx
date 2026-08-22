import { cn } from "@/lib/cn";

/**
 * Layered ambient background: base radial gradient + technical grid + subtle
 * noise + floating blurred light "blobs". Rendered fixed behind all routes.
 * Honors prefers-reduced-motion by freezing the float animation.
 */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Layer 1 — base radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]" />

      {/* Layer 2 — technical grid */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Layer 3 — floating light blobs */}
      <div className="absolute left-1/2 top-[-10%] h-[900px] w-[1400px] -translate-x-1/2 rounded-full bg-[#5E6AD2] opacity-[0.18] blur-[150px] motion-safe:animate-[blob-float_9s_ease-in-out_infinite]" />
      <div className="absolute left-[-8%] top-[20%] h-[600px] w-[800px] rounded-full bg-[#6d5cff] opacity-[0.12] blur-[120px] motion-safe:animate-[blob-float_11s_ease-in-out_infinite_1s]" />
      <div className="absolute right-[-6%] top-[30%] h-[500px] w-[700px] rounded-full bg-[#3b5bdb] opacity-[0.12] blur-[100px] motion-safe:animate-[blob-float_10s_ease-in-out_infinite_2s]" />
      <div className="absolute bottom-[-10%] left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-[#5E6AD2] opacity-[0.10] blur-[130px] motion-safe:animate-[blob-pulse_8s_ease-in-out_infinite]" />

      {/* Layer 4 — fine noise grain */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-soft-light" />

      {/* Top vignette for header legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background-deep/80 to-transparent" />
    </div>
  );
}
