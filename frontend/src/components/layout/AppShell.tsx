import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ComplaintWatcher } from "@/hooks/useComplaintNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";
import { pageTransition } from "@/lib/motion-presets";

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role ?? "CITIZEN";

  return (
    <div
      data-role={role}
      className={cn(
        "min-h-dvh bg-background",
        "grid grid-rows-[1fr_auto] lg:grid-cols-[250px_1fr] lg:grid-rows-[1fr_auto]",
        "[grid-template-areas:'main'_'bottomnav']",
        "lg:[grid-template-areas:'sidebar_main'_'sidebar_bottomnav']",
      )}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Sidebar - only on desktop */}
      <aside className="hidden lg:block sidebar-area" aria-label="Main navigation">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className={cn(
          "main-area lg:col-start-2",
          "mx-auto w-full max-w-7xl px-4 pb-20 pt-6 lg:px-8 lg:pb-12",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation - only on mobile */}
      <nav className="bottomnav-area lg:hidden" aria-label="Mobile navigation">
        <BottomNav />
      </nav>

      <ComplaintWatcher />
    </div>
  );
}