import { useState } from "react";
import { LogOut, UserRound, Menu, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/components/layout/Brand";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  CITIZEN: <span className="text-primary">🛡️</span>,
  WORKER: <span className="text-warning">🔧</span>,
  AUTHORITY: <span className="text-info">⚖️</span>,
};

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <Brand variant="full" className="lg:hidden" />
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative h-9 w-9"
              aria-label="Account menu"
            >
              <Avatar className="size-9">
                <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
            <DropdownMenuLabel className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-role-accent/10 text-role-accent">
                  {user?.role && ROLE_ICONS[user.role]}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              {user?.role && (
                <Badge tone="brand" variant="solid" size="sm">
                  {user.role}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/profile")}>
              <UserRound aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/settings")}>
              <Settings aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            {user?.role === "AUTHORITY" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/authority")}>
                  <Shield aria-hidden="true" />
                  Authority Dashboard
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={handleLogout}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden bg-background-deep/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}