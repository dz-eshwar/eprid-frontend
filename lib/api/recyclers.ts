import { apiFetch } from "./client";
import type { RecyclerSummary } from "./types";

export const getMyRecyclerProfile = (token: string) =>
  apiFetch<RecyclerSummary>("/api/v1/recyclers/me", {}, token);
