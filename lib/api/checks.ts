import { apiFetch } from "./client";
import type {
  CreateCheckRequest,
  EvidenceUploadResponse,
  RegulatoryHistoryResponse,
  VerificationCheckResponse,
} from "./types";

export const createCheck = (req: CreateCheckRequest, token: string) =>
  apiFetch<VerificationCheckResponse>("/api/v1/checks", {
    method: "POST",
    body: JSON.stringify(req),
  }, token);

export const getCheck = (checkId: string, token: string) =>
  apiFetch<VerificationCheckResponse>(`/api/v1/checks/${checkId}`, {}, token);

export const listChecks = (token: string) =>
  apiFetch<VerificationCheckResponse[]>("/api/v1/checks", {}, token);

export const triggerRegulatoryHistory = (checkId: string, token: string) =>
  apiFetch<{ checkId: string; message: string }>(
    `/api/v1/checks/${checkId}/regulatory-history`,
    { method: "POST" },
    token
  );

export const getRegulatoryHistory = (checkId: string, token: string) =>
  apiFetch<RegulatoryHistoryResponse>(
    `/api/v1/checks/${checkId}/regulatory-history`,
    {},
    token
  );

export const uploadEvidence = (
  checkId: string,
  files: File[],
  types: string[],
  token: string
) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  types.forEach((t) => form.append("types", t));
  return apiFetch<EvidenceUploadResponse>(
    `/api/v1/checks/${checkId}/evidence`,
    { method: "POST", body: form },
    token
  );
};
