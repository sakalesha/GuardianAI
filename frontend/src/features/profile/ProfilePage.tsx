import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, ClipboardCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useComplaints } from "@/hooks/useComplaints";
import { isActionable } from "@/lib/filters";
import { isReviewable } from "@/lib/review";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Citizen",
  WORKER: "Worker",
  AUTHORITY: "Authority",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data = [] } = useComplaints();

  const stats = useMemo(() => {
    if (!user) return [];
    const resolved = (c: { status: string }) =>
      c.status === "RESOLVED" || c.status === "VERIFIED_RESOLUTION";
    if (user.role === "CITIZEN") {
      const mine = data.filter((c) => c.userId === user.uid);
      return [
        { label: "Reports filed", value: mine.length },
        { label: "Active", value: mine.filter((c) => isActionable(c.status)).length },
        { label: "Resolved", value: mine.filter((c) => resolved(c)).length },
      ];
    }
    if (user.role === "WORKER") {
      return [
        { label: "Open jobs", value: data.filter((c) => isActionable(c.status)).length },
        { label: "Resolved", value: data.filter((c) => resolved(c)).length },
        {
          label: "Overdue SLA",
          value: data.filter(
            (c) => isActionable(c.status) && Date.now() > new Date(c.slaDeadline).getTime(),
          ).length,
        },
      ];
    }
    return [
      { label: "Needs review", value: data.filter((c) => isReviewable(c.status)).length },
      { label: "Open", value: data.filter((c) => isActionable(c.status)).length },
      { label: "Resolved", value: data.filter((c) => resolved(c)).length },
    ];
  }, [data, user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account and role on CivicProof."
      />
      <Card className="max-w-lg">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="size-16 text-lg">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <Badge variant="secondary">{ROLE_LABELS[user.role] ?? user.role}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono">{user.uid}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{ROLE_LABELS[user.role] ?? user.role}</dd>
            </div>
          </dl>
          {user.role !== "CITIZEN" && (
            <div className="flex flex-wrap gap-2">
              {user.role === "AUTHORITY" && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/authority">
                    <ClipboardCheck aria-hidden="true" />
                    Review queue
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/analytics">
                  <BarChart3 aria-hidden="true" />
                  Analytics
                </Link>
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <div className="grid max-w-lg grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Stat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
}