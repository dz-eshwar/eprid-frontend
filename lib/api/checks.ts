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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function downloadReport(checkId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/checks/${checkId}/report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eprid-report-${checkId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
