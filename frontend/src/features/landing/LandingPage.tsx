import { useRef, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Wrench,
  Bell,
  Scale,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Gauge,
  Users,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brand } from "@/components/layout/Brand";
import { SpotlightCard } from "@/components/SpotlightCard";
import { GradientText, AccentText } from "@/components/GradientText";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { useAuth } from "@/contexts/AuthContext";
import { roleHomePath } from "@/lib/roles";

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: MapPin,
    title: "Live civic map",
    body: "Every report pinned to a live map — see what's broken near you and watch it get fixed in real time.",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    body: "Get notified the moment your report is acknowledged, assigned, or resolved. No more guessing.",
  },
  {
    icon: Wrench,
    title: "Worker dispatch",
    body: "Field crews claim, update, and close tasks from one place — with photo proof at every step.",
  },
  {
    icon: Scale,
    title: "Authority oversight",
    body: "City officials get a bird's-eye view of service levels, SLAs, and equity across districts.",
  },
  {
    icon: BarChart3,
    title: "Open analytics",
    body: "Public dashboards turn raw reports into trust — response times, volume, and resolution rates.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & private",
    body: "Citizen identity is verified but anonymized. Reports are tamper-evident and audit-ready.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Report in seconds",
    body: "Drop a pin, snap a photo, describe the issue. No account bureaucracy, no forms.",
  },
  {
    n: "02",
    title: "Routed automatically",
    body: "The right department or crew is notified instantly and the clock on a public SLA starts.",
  },
  {
    n: "03",
    title: "Resolved in the open",
    body: "Track progress to closure and see the impact across your community in live dashboards.",
  },
];

const ROLES = [
  {
    icon: Users,
    label: "CITIZEN",
    accent: "text-role-citizen",
    ring: "bg-role-citizen/10",
    bullets: ["Report issues in seconds", "Track status live", "Hold services accountable"],
  },
  {
    icon: Wrench,
    label: "WORKER",
    accent: "text-role-worker",
    ring: "bg-role-worker/10",
    bullets: ["Claim assigned tasks", "Update with photo proof", "Close the loop fast"],
  },
  {
    icon: Scale,
    label: "AUTHORITY",
    accent: "text-role-authority",
    ring: "bg-role-authority/10",
    bullets: ["Oversee all districts", "Monitor SLAs & equity", "Publish open dashboards"],
  },
];

const STATS = [
  { value: "12", label: "Cities live" },
  { value: "48h", label: "Median response" },
  { value: "93%", label: "Resolved" },
  { value: "4.8★", label: "Citizen rating" },
];

export function LandingPage() {
  const { user, status } = useAuth();
  const heroRef = useHeroParallax();

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }
  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand variant="full" />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#roles" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Roles
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link to="/register">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <motion.section
          style={{ opacity: heroRef.opacity, y: heroRef.y, scale: heroRef.scale }}
          className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 lg:px-8 lg:pt-28"
        >
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div>
              <Badge
                variant="outline"
                className="mb-6 border-white/[0.08] bg-white/[0.03] px-3 py-1 text-muted-foreground"
              >
                <Sparkles className="size-3.5 text-primary" />
                Civic infrastructure for the AI era
              </Badge>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Report. Resolve.
                <br />
                <GradientText>Rebuild trust.</GradientText>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                <AccentText>CivicProof</AccentText> connects citizens, field crews, and city
                halls on one transparent platform — so every pothole, leak, and broken light
                gets seen, owned, and fixed in the open.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/register">
                    Start reporting <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/login">I'm city staff</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4" />
                Free for citizens · No credit card · Verified &amp; private
              </div>
            </div>

            <Reveal delay={0.1} className="relative">
              <div className="relative rounded-3xl border border-white/[0.08] bg-card/80 p-5 shadow-[0_0_0_1px_rgb(255_255_255/0.05),0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-xl">
                <div className="absolute -right-6 -top-6 size-32 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-success" />
                    <span className="text-sm font-medium text-foreground">Nearby reports</span>
                  </div>
                  <Badge tone="brand" variant="soft" size="sm">
                    Live
                  </Badge>
                </div>
                {[
                  { t: "Floodlight out on 9th Ave", s: "Acknowledged", tone: "text-role-worker" as const, dot: "bg-role-worker" as const },
                  { t: "Pothole near Riverside Park", s: "In progress", tone: "text-primary" as const, dot: "bg-primary" as const },
                  { t: "Illegal dumping — Elm St", s: "Resolved", tone: "text-success" as const, dot: "bg-success" as const },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="mb-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 last:mb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${r.dot}`} />
                      <span className="text-sm text-foreground">{r.t}</span>
                    </div>
                    <span className={`text-xs font-medium ${r.tone}`}>{r.s}</span>
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-primary/[0.06] px-4 py-3">
                  <Gauge className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Median response time{" "}
                    <span className="font-semibold text-foreground">down 41%</span> this quarter
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </motion.section>

        <section className="border-y border-white/[0.06] bg-white/[0.015] py-10">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              Trusted by local governments and resident associations across
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-muted-foreground/70">
              {["Northbridge", "Lakeside", "Eastvale", "Pinewood", "Riverton"].map((c) => (
                <span key={c} className="font-display text-lg font-semibold tracking-tight">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-white/[0.08] bg-white/[0.03] text-muted-foreground">
              Why CivicProof
            </Badge>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              One platform for the <GradientText>entire civic loop</GradientText>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              From the first report to the final fix, everyone works from the same source of
              truth — and the public can see it happen.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <SpotlightCard className="h-full rounded-2xl border border-white/[0.08] bg-card/70 p-6 backdrop-blur-xl">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/[0.1] text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-20 border-y border-white/[0.06] bg-white/[0.015] py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 border-white/[0.08] bg-white/[0.03] text-muted-foreground">
                How it works
              </Badge>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                From <AccentText>broken</AccentText> to <GradientText>fixed</GradientText>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="relative rounded-2xl border border-white/[0.08] bg-card/70 p-6 backdrop-blur-xl">
                    <span className="font-display text-3xl font-bold text-primary/80">{s.n}</span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4 border-white/[0.08] bg-white/[0.03] text-muted-foreground">
              Built for every role
            </Badge>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Same city, <GradientText>different lenses</GradientText>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-white/[0.08] bg-card/70 p-6 backdrop-blur-xl">
                  <span className={`mb-4 flex size-11 items-center justify-center rounded-xl ${r.ring} ${r.accent}`}>
                    <r.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">{r.label}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.015] py-16">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 lg:grid-cols-4 lg:px-8">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05} className="text-center">
                <div className="font-display text-4xl font-bold text-foreground sm:text-5xl">
                  <GradientText>{s.value}</GradientText>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-card/80 px-8 py-16 text-center shadow-[0_0_0_1px_rgb(255_255_255/0.05),0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-role-authority/20 blur-3xl" aria-hidden="true" />
              <h2 className="relative font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Ready to make your city <GradientText>accountable?</GradientText>
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
                Join the cities turning complaints into trust. Set up takes minutes — your
                residents will thank you.
              </p>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/register">
                    Get started free <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/login">Talk to our team</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] bg-background/60 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row lg:px-8">
          <Brand variant="full" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CivicProof. Built in the open.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#roles" className="transition-colors hover:text-foreground">Roles</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
