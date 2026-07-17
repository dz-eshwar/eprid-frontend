import type { ApiResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Carries the backend's X-Request-Id so a failed request can be matched to its
// exact server-side log lines (see requestId in Railway logs).
export class ApiError extends Error {
  status: number;
  requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const requestId = res.headers.get("X-Request-Id") ?? undefined;
  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    const message = body.errors?.join(", ") ?? body.message ?? `Request failed (${res.status})`;
    console.error(`[apiFetch] ${path} failed: ${message}${requestId ? ` (requestId: ${requestId})` : ""}`);
    throw new ApiError(message, res.status, requestId);
  }

  return body.data as T;
}
