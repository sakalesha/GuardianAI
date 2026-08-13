import { apiRequest } from "@/api/client";
import { authResponseSchema, authUserSchema } from "@/api/schemas";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
    schema: authResponseSchema,
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
    schema: authResponseSchema,
  });
}

export function me(): Promise<AuthUser> {
  return apiRequest("/auth/me", {
    schema: authUserSchema,
  });
}