export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
}