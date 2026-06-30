import { apiFetch } from "./client";
import type { ComplianceEstimateRequest, ComplianceEstimateResponse } from "./types";

export const calculateEstimate = (req: ComplianceEstimateRequest) =>
  apiFetch<ComplianceEstimateResponse>("/api/v1/calculator/estimate", {
    method: "POST",
    body: JSON.stringify(req),
  });
