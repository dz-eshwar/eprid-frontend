import { apiFetch } from "./client";
import type {
  Ca1FormChecklistResponse,
  Ca1PrerequisiteCheckRequest,
  Ca1PrerequisiteCheckResponse,
  Ca2ReadinessChecklistResponse,
  FeeCalculationRequest,
  FeeCalculationResponse,
  TierDeterminationRequest,
  TierDeterminationResponse,
  UsedOilSummaryRequest,
  UsedOilSummaryResponse,
} from "./types";

export const determineTier = (req: TierDeterminationRequest) =>
  apiFetch<TierDeterminationResponse>("/api/v1/used-oil/tier-determination", {
    method: "POST",
    body: JSON.stringify(req),
  });

export const checkCa1Prerequisite = (req: Ca1PrerequisiteCheckRequest) =>
  apiFetch<Ca1PrerequisiteCheckResponse>("/api/v1/used-oil/ca1-prerequisite-check", {
    method: "POST",
    body: JSON.stringify(req),
  });

export const getCa2ReadinessChecklist = () =>
  apiFetch<Ca2ReadinessChecklistResponse>("/api/v1/used-oil/ca2-readiness-checklist");

export const calculateFee = (req: FeeCalculationRequest) =>
  apiFetch<FeeCalculationResponse>("/api/v1/used-oil/fee-calculation", {
    method: "POST",
    body: JSON.stringify(req),
  });

export const getCa1FormChecklist = () =>
  apiFetch<Ca1FormChecklistResponse>("/api/v1/used-oil/ca1-form-checklist");

export const getSummary = (req: UsedOilSummaryRequest) =>
  apiFetch<UsedOilSummaryResponse>("/api/v1/used-oil/summary", {
    method: "POST",
    body: JSON.stringify(req),
  });

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function downloadPdf(path: string, req: UsedOilSummaryRequest, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const downloadSummaryPdf = (req: UsedOilSummaryRequest) =>
  downloadPdf("/api/v1/used-oil/summary/pdf", req, "eprid-used-oil-summary.pdf");

export const downloadApplicationPdf = (req: UsedOilSummaryRequest) =>
  downloadPdf(
    "/api/v1/used-oil/application/pdf",
    req,
    `eprid-used-oil-${req.tier === "CA_1" ? "ca1" : "ca2"}-application.pdf`
  );
