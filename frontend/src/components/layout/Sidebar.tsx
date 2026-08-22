import { useState, useEffect } from "react";
import { LogOut, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { itemsForRole } from "@/components/layout/navItems";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "motion/react";

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = itemsForRole(user?.role ?? null);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
  }, [collapsed, mounted]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!mounted) {
    return (
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-card/80 backdrop-blur-xl lg:flex" />
    );
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/[0.06] bg-card/80 backdrop-blur-xl transition-all duration-normal lg:relative lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64",
        )}
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        aria-label="Main navigation"
      >
        <div className={cn("flex h-16 items-center border-b px-4 transition-all duration-normal", collapsed && "px-2 justify-center")}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="font-display text-lg font-semibold tracking-tight whitespace-nowrap"
            >
              Guardian<span className="text-primary">AI</span>
            </motion.span>
          )}
          {collapsed && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="font-display text-lg font-bold">G</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto shrink-0", collapsed && "mx-auto")}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 transition-all duration-normal" role="navigation" aria-label="Primary">
          {items.map((item) => (
            collapsed ? (
              <Tooltip key={`${item.label}-${item.to}`}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative overflow-hidden",
                        isActive
                          ? "bg-role-accent/10 text-role-accent before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-role-accent"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )
                    }
                  >
                    <span className="size-5 shrink-0 flex items-center justify-center" aria-hidden="true">
                      <item.icon className="size-4" />
                    </span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="z-50">
                  <span className="whitespace-nowrap">{item.label}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={`${item.label}-${item.to}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative overflow-hidden",
                    isActive
                      ? "bg-role-accent/10 text-role-accent before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-role-accent"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <span className="size-5 shrink-0 flex items-center justify-center" aria-hidden="true">
                  <item.icon className="size-4" />
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            )
          ))}
        </nav>

        <div className={cn("border-t p-3 transition-all duration-normal mt-auto pt-6", collapsed && "px-2")}>
          <div className={cn("flex items-center justify-between gap-2", collapsed && "justify-center")}>
            <div className={cn("min-w-0 flex-1", collapsed && "hidden")}>
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <NotificationBell />
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sign out"
                      onClick={handleLogout}
                    >
                      <LogOut aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    <span>Sign out</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                  onClick={handleLogout}
                >
                  <LogOut aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {!collapsed && user?.role && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: "auto" }}
              className="mt-3 pt-3 border-t"
            >
              <Badge tone="brand" variant="solid" size="sm" className="w-full justify-center">
                {user.role}
              </Badge>
            </motion.div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}