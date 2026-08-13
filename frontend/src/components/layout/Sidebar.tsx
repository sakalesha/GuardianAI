import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { itemsForRole } from "@/components/layout/navItems";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = itemsForRole(user?.role ?? null);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <span className="font-display text-lg font-semibold tracking-tight">
          Civic<span className="text-primary">Proof</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Primary">
        {items.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-role-accent/10 text-role-accent"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-2 border-t p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  );
}