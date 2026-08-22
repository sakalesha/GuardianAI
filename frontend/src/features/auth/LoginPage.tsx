import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeError } from "@/api/client";
import { roleHomePath } from "@/lib/roles";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

const DEMO_ACCOUNTS = [
  { label: "Citizen", email: "citizen@demo.com", password: "password123" },
  { label: "Worker", email: "worker@demo.com", password: "password123" },
  { label: "Authority", email: "authority@demo.com", password: "password123" },
] as const;

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [rootError, setRootError] = useState<string | null>(null);

  // Request location permission on mount if not already granted
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const hasPrompted = sessionStorage.getItem("geolocation-prompted");
    if (hasPrompted) return;
    sessionStorage.setItem("geolocation-prompted", "true");
    navigator.geolocation.getCurrentPosition(
      () => {},
      () => {} // Ignore error - permission will be remembered
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  async function onSubmit(values: LoginInput) {
    setRootError(null);
    try {
      const authed = await login(values);
      navigate(roleHomePath(authed.role), { replace: true });
    } catch (err) {
      setRootError(normalizeError(err).message);
    }
  }

  async function quickLogin(email: string, password: string) {
    setRootError(null);
    try {
      const authed = await login({ email, password });
      navigate(roleHomePath(authed.role), { replace: true });
    } catch (err) {
      setRootError(normalizeError(err).message);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to track and resolve community issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rootError && (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Demo accounts</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin(account.email, account.password)}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
            <LogIn className="size-3.5" aria-hidden="true" />
            New to CivicProof?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}