import { useRef, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { itemsForRole } from "@/components/layout/navItems";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationCenter } from "@/contexts/NotificationCenterContext";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export function BottomNav() {
  const { user } = useAuth();
  const { unreadCount } = useNotificationCenter();
  const location = useLocation();
  const items = itemsForRole(user?.role ?? null).filter((item) => item.to !== "/profile");
  const activeItemRef = useRef<HTMLLIElement>(null);
  const [pillStyle, setPillStyle] = useState({ transform: "translateX(0)", width: 0, opacity: 0 });

  useEffect(() => {
    updatePillPosition();
    window.addEventListener("resize", updatePillPosition);
    return () => window.removeEventListener("resize", updatePillPosition);
  }, [location.pathname, items.length]);

  const updatePillPosition = () => {
    const activeLink = document.querySelector('[data-bottom-nav-active="true"]');
    const nav = document.querySelector('[data-bottom-nav]');
    if (activeLink && nav) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setPillStyle({
        transform: `translateX(${linkRect.left - navRect.left}px)`,
        width: linkRect.width,
        opacity: 1,
      });
    }
  };

  const getBadgeCount = (to: string) => {
    if (to === "/reports") return unreadCount;
    return 0;
  };

  return (
    <nav
      ref={(el) => { if (el) nav.current = el; }}
      data-bottom-nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-background/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:hidden"
      role="navigation"
    >
      <div className="relative mx-auto flex max-w-lg h-16 items-center justify-around px-2">
        <AnimatePresence mode="popLayout">
          <motion.div
            className="absolute bottom-[calc(100%_-_4px)] left-0 h-1.5 rounded-full bg-role-accent transition-all duration-normal ease-out"
            style={pillStyle}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          />
        </AnimatePresence>

        <ul className="flex w-full items-center justify-around" role="tablist">
          {items.map((item) => {
            const isActive = location.pathname === item.to || (item.end && location.pathname.startsWith(item.to));
            const badgeCount = getBadgeCount(item.to);

            return (
              <li
                key={`${item.label}-${item.to}`}
                ref={isActive ? activeItemRef : undefined}
                data-bottom-nav-active={isActive}
                className="flex-1"
                role="presentation"
              >
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors z-10",
                    isActive
                      ? "text-role-accent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={item.label}
                >
                  <span className="relative flex size-5 items-center justify-center">
                    <item.icon className="size-5" aria-hidden="true" />
                    {badgeCount > 0 && (
                      <Badge
                        tone="destructive"
                        variant="solid"
                        size="sm"
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px]"
                      >
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </Badge>
                    )}
                  </span>
                  <span className="truncate max-w-[60px]">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

const nav = { current: null as HTMLElement | null };