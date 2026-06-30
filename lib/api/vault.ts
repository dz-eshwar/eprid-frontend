import { apiFetch } from "./client";
import type { VaultConsentStatus, VaultDocument, VaultDocType, VaultDocTypeInfo } from "./types";

const BASE = "/api/v1/vault";

export const listMyDocs = (token: string) =>
  apiFetch<VaultDocument[]>(BASE, {}, token);

export const listForRecycler = (recyclerId: string, token: string) =>
  apiFetch<VaultDocument[]>(`${BASE}/recycler/${recyclerId}`, {}, token);

export const getConsentStatus = (recyclerId: string, token: string) =>
  apiFetch<VaultConsentStatus>(`${BASE}/consent/${recyclerId}`, {}, token);

export const uploadDoc = (
  file: File,
  recyclerId: string,
  docType: VaultDocType,
  displayName: string,
  consentAcceptedAt: string,
  notes: string | undefined,
  token: string
) => {
  const form = new FormData();
  form.append("file", file);
  form.append("recyclerId", recyclerId);
  form.append("docType", docType);
  form.append("displayName", displayName);
  form.append("consentAcceptedAt", consentAcceptedAt);
  if (notes) form.append("notes", notes);
  return apiFetch<VaultDocument>(BASE, { method: "POST", body: form }, token);
};

export const deleteDoc = (docId: string, token: string) =>
  apiFetch<boolean>(`${BASE}/${docId}`, { method: "DELETE" }, token);

export const listDocTypes = (token: string) =>
  apiFetch<VaultDocTypeInfo[]>(`${BASE}/document-types`, {}, token);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function downloadDoc(docId: string, fileName: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/vault/${docId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
