import type { ApiError } from "@/types/api";
import type { ZodType } from "zod";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export const TOKEN_KEY = "civicproof_token";

export const UNAUTHORIZED_EVENT = "civicproof:unauthorized";

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function createApiError(status: number, message: string, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.name = "ApiError";
  error.status = status;
  if (details !== undefined) error.details = details;
  return error;
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof Error && "status" in err) {
    return err as ApiError;
  }
  if (err instanceof Error) {
    return createApiError(0, err.message);
  }
  return createApiError(0, "Unexpected error");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  schema?: ZodType<unknown>;
  timeoutMs?: number;
  signal?: AbortSignal;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    schema,
    timeoutMs = 15_000,
    signal,
    auth = true,
  } = options;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onOuterAbort);
  }

  const token = auth ? getToken() : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw createApiError(0, "Request timed out. Please try again.");
    }
    throw createApiError(0, "Network error. Please check your connection.");
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onOuterAbort);
  }

  if (response.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const record = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const message =
      (typeof record.message === "string" && record.message) ||
      (typeof record.error === "string" && record.error) ||
      `Request failed with status ${response.status}`;
    throw createApiError(response.status, message, data);
  }

  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw createApiError(
        response.status,
        "Unexpected response shape from server",
        parsed.error,
      );
    }
    return parsed.data as T;
  }

  return data as T;
}