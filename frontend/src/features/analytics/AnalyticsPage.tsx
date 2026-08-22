import { useMemo } from "react";
import { format } from "date-fns";
import {
  Activity,
  BarChart3,
  CircleGauge,
  Clock,
  RefreshCw,
  ShieldCheck,
  Timer,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useComplaints } from "@/hooks/useComplaints";
import { normalizeError } from "@/api/client";
import { computeAnalytics } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/complaints/EmptyState";

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const { data = [], isLoading, isError, error, refetch } = useComplaints();
  const a = useMemo(() => computeAnalytics(data), [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Platform performance at a glance." />
        <EmptyState
          variant="error"
          title="Could not load analytics"
          description={normalizeError(error).message}
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (a.total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Platform performance at a glance." />
        <EmptyState
          variant="no-reports"
          title="No data yet"
          description="Analytics will populate as citizens file reports."
        />
      </div>
    );
  }

  const avgHours = a.avgResolutionHours;
  const avgLabel =
    avgHours === null
      ? "—"
      : avgHours >= 48
        ? `${(avgHours / 24).toFixed(1)} days`
        : `${Math.round(avgHours)} hrs`;
  const passLabel =
    a.verificationPassRate === null ? "—" : `${Math.round(a.verificationPassRate)}%`;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform performance at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Total reports" value={String(a.total)} icon={Activity} />
        <KpiCard label="Open" value={String(a.open)} sub="Awaiting action" icon={Clock} />
        <KpiCard label="Overdue SLA" value={String(a.overdue)} sub="Open past deadline" icon={Timer} />
        <KpiCard label="Avg resolution" value={avgLabel} sub="Report → resolved" icon={CircleGauge} />
        <KpiCard label="Verification pass" value={passLabel} sub="Of attempted resolutions" icon={ShieldCheck} />
        <KpiCard label="Resolved (7d)" value={String(a.resolved7d)} sub="Last 7 days" icon={BarChart3} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Reports by status">
          <PieChart>
            <Pie
              data={a.statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {a.statusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard title="SLA compliance by category">
          <BarChart data={a.slaData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category"               tick={{ fill: "#a1a1aa", fontSize: 12 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa" }} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Legend />
            <Bar dataKey="withinSla" name="Within SLA" stackId="sla" fill="#059669" />
            <Bar dataKey="breached" name="Breached" stackId="sla" fill="#e11d48" />
            <Bar dataKey="open" name="Open" stackId="sla" fill="#d97706" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Reports by category">
          <BarChart data={a.categoryData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category"               tick={{ fill: "#a1a1aa", fontSize: 12 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa" }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
              {a.categoryData.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Reports per day (last 30 days)">
          <AreaChart data={a.trendData}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5E6AD2" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#5E6AD2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={(value: string) => format(new Date(value), "MMM d")}
              interval={5}
            />
            <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa" }} />
            <Tooltip
              labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
              contentStyle={{
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Reports"
              stroke="#5E6AD2"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}