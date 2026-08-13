import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ClipboardCheck, ShieldCheck, UserRound } from "lucide-react";
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
import { cn } from "@/lib/cn";
import { roleHomePath } from "@/lib/roles";
import { type Role } from "@/types/auth";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";

const ROLE_OPTIONS: { role: Role; label: string; description: string; icon: typeof UserRound }[] =
  [
    { role: "CITIZEN", label: "Citizen", description: "Report and track issues", icon: UserRound },
    { role: "WORKER", label: "Worker", description: "Claim and resolve jobs", icon: ClipboardCheck },
    { role: "AUTHORITY", label: "Authority", description: "Review and verify", icon: ShieldCheck },
  ];

export function RegisterPage() {
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CITIZEN" },
  });

  const selectedRole = watch("role");

  if (isAuthenticated && user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  async function onSubmit(values: RegisterInput) {
    setRootError(null);
    try {
      const authed = await registerUser(values);
      navigate(roleHomePath(authed.role), { replace: true });
    } catch (err) {
      setRootError(normalizeError(err).message);
    }
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-xl">Create your account</CardTitle>
          <CardDescription>Choose a role to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rootError && (
            <Alert variant="destructive">
              <AlertTitle>Unable to register</AlertTitle>
              <AlertDescription>{rootError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Role</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {ROLE_OPTIONS.map(({ role, label, description, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={selectedRole === role}
                    onClick={() => setValue("role", role, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-colors",
                      selectedRole === role
                        ? "border-role-accent bg-role-accent/10 text-role-accent"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
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
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}