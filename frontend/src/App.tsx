import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/RootLayout";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";
import { PageFallback } from "@/components/layout/PageFallback";
import { RequireAuth, RequireRole } from "@/components/guards";

function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Lazy = lazy(factory);
  return function LazyPage() {
    return (
      <Suspense fallback={<PageFallback />}>
        <Lazy />
      </Suspense>
    );
  };
}

const LoginPage = lazyPage(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazyPage(() =>
  import("@/features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const HomeRedirect = lazyPage(() =>
  import("@/features/home/HomeRedirect").then((m) => ({ default: m.HomeRedirect })),
);
const NotFoundPage = lazyPage(() =>
  import("@/features/home/HomeRedirect").then((m) => ({ default: m.NotFoundPage })),
);
const MapPage = lazyPage(() =>
  import("@/features/map/MapPage").then((m) => ({ default: m.MapPage })),
);
const ReportsPage = lazyPage(() =>
  import("@/features/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
const ComplaintDetailPage = lazyPage(() =>
  import("@/features/detail/ComplaintDetailPage").then((m) => ({
    default: m.ComplaintDetailPage,
  })),
);
const ResolvePage = lazyPage(() =>
  import("@/features/resolve/ResolvePage").then((m) => ({ default: m.ResolvePage })),
);
const ReportPage = lazyPage(() =>
  import("@/features/report/ReportPage").then((m) => ({ default: m.ReportPage })),
);
const AuthorityPage = lazyPage(() =>
  import("@/features/authority/AuthorityPage").then((m) => ({ default: m.AuthorityPage })),
);
const AnalyticsPage = lazyPage(() =>
  import("@/features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const ProfilePage = lazyPage(() =>
  import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomeRedirect /> },
          {
            path: "map",
            element: (
              <RequireAuth>
                <MapPage />
              </RequireAuth>
            ),
          },
          {
            path: "reports",
            element: (
              <RequireAuth>
                <ReportsPage />
              </RequireAuth>
            ),
          },
          {
            path: "reports/:id",
            element: (
              <RequireAuth>
                <ComplaintDetailPage />
              </RequireAuth>
            ),
          },
          {
            path: "reports/:id/resolve",
            element: (
              <RequireRole roles={["WORKER"]}>
                <ResolvePage />
              </RequireRole>
            ),
          },
          {
            path: "report",
            element: (
              <RequireRole roles={["CITIZEN"]}>
                <ReportPage />
              </RequireRole>
            ),
          },
          {
            path: "authority",
            element: (
              <RequireRole roles={["AUTHORITY"]}>
                <AuthorityPage />
              </RequireRole>
            ),
          },
          {
            path: "analytics",
            element: (
              <RequireRole roles={["WORKER", "AUTHORITY"]}>
                <AnalyticsPage />
              </RequireRole>
            ),
          },
          {
            path: "profile",
            element: (
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            ),
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);