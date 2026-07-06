import { apiFetch } from "./client";
import type { CredentialCheckOutcomeDto } from "./types";

export const getMyCredentialChecks = (token: string) =>
  apiFetch<CredentialCheckOutcomeDto[]>("/api/v1/recyclers/me/credential-checks", {}, token);
