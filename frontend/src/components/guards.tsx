import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: readonly Role[]; children: ReactNode }) {
  const { user, status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={user?.role === "AUTHORITY" ? "/authority" : "/reports"} replace />;
  }
  return <>{children}</>;
}