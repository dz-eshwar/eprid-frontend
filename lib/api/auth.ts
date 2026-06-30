import { apiFetch } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export const register = (req: RegisterRequest) =>
  apiFetch<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });

export const login = (req: LoginRequest) =>
  apiFetch<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
