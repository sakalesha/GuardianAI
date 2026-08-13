import { NavLink } from "react-router-dom";
import { itemsForRole } from "@/components/layout/navItems";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";

export function BottomNav() {
  const { user } = useAuth();
  const items = itemsForRole(user?.role ?? null).filter((item) => item.to !== "/profile");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {items.map((item) => (
          <li key={`${item.label}-${item.to}`} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-role-accent"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}