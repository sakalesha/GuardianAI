import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ComplaintWatcher } from "@/hooks/useComplaintNotifications";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div data-role={user?.role ?? "CITIZEN"} className="min-h-dvh bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar />
      <Topbar />
      <main id="main-content" className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      <BottomNav />
      <ComplaintWatcher />
    </div>
  );
}