// ─── Calculator ──────────────────────────────────────────────────────────────

export type BatteryCategory = "PORTABLE" | "AUTOMOTIVE" | "INDUSTRIAL" | "ELECTRIC_VEHICLE";

export const BATTERY_CATEGORY_LABELS: Record<BatteryCategory, string> = {
  PORTABLE: "Portable",
  AUTOMOTIVE: "Automotive",
  INDUSTRIAL: "Industrial",
  ELECTRIC_VEHICLE: "Electric Vehicle (EV)",
};

export const FINANCIAL_YEARS = ["2024-25", "2025-26", "2026-27"] as const;
export type FinancialYear = (typeof FINANCIAL_YEARS)[number];

export interface ComplianceEstimateRequest {
  batteryCategory: BatteryCategory;
  financialYear: FinancialYear;
  quantityPlacedTonnes: number;
  quantityAlreadyFulfilledTonnes?: number;
}

export interface CallToAction {
  message: string;
  action: string;
}

export interface EcExposureBreakdown {
  ecDepositedRs: number;
  netIfResolvedYear1Rs: number;
  netIfResolvedYear2Rs: number;
  netIfResolvedYear3Rs: number;
  netIfForfeitedRs: number;
  ecRatePerTonneRs: number;
  caveat: string;
}

export interface ComplianceEstimateResponse {
  estimateId: string;
  batteryCategory: BatteryCategory;
  financialYear: FinancialYear;
  quantityPlacedTonnes: number;
  quantityAlreadyFulfilledTonnes: number;
  recoveryTargetPercent: number;
  targetTonnes: number;
  shortfallTonnes: number;
  shortfallKg: number;
  ecExposure: EcExposureBreakdown | null;
  disclaimer: string;
  callToAction: CallToAction;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "CONSULTANT" | "PRODUCER_STAFF" | "ADMIN" | "RECYCLER" | "PUBLISHER";

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

// ─── Verification Checks ─────────────────────────────────────────────────────

export type CheckStatus = "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
export type RiskRating = "LOW" | "MEDIUM" | "HIGH";

export interface CreateCheckRequest {
  recyclerName: string;
  bwmrRegNumber?: string;
  recyclerState?: string;
  recyclerSelfReportedCapacityT?: number;
  producerName: string;
  cpcbRegNumber?: string;
  batchWeightTonnes: number;
  claimedRecoveryPct: number;
  processingDate: string; // ISO date string "YYYY-MM-DD"
  complianceEstimateId?: string;
}

// ─── Plausibility ─────────────────────────────────────────────────────────────

export type SubCheckStatus = "PASS" | "WARN" | "FAIL" | "UNVERIFIABLE";

export interface PlausibilitySubCheck {
  name: string;
  status: SubCheckStatus;
  detail: string;
  referenceValue: string | null;
}

export interface PlausibilityCheckResponse {
  checkId: string;
  overallStatus: SubCheckStatus;
  subChecks: PlausibilitySubCheck[];
  caveat: string;
}

// ─── Regulatory history ───────────────────────────────────────────────────────

export type RegulatoryStatus = "NOT_STARTED" | "PENDING" | "COMPLETE" | "FAILED";
export type RegulatoryRisk   = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export interface RegulatoryFindingDto {
  id: string;
  source: string;
  findingType: string;
  severity: string;
  title: string;
  summary: string;
  url: string | null;
  findingDate: string | null;
  confidence: string;
}

export interface RegulatoryHistoryResponse {
  checkId: string;
  recyclerName: string;
  bwmrRegNumber: string | null;
  status: RegulatoryStatus;
  overallRisk: RegulatoryRisk | null;
  rationale: string | null;
  recommendation: string | null;
  caveat: string | null;
  findings: RegulatoryFindingDto[];
}

export interface VerificationCheckResponse {
  id: string;
  recyclerName: string;
  recyclerId: string;
  producerName: string;
  producerId: string;
  batchWeightTonnes: number;
  claimedRecoveryPct: number;
  processingDate: string;
  status: CheckStatus;
  riskRating: RiskRating | null;
  riskSummary: string | null;
  evidenceCount: number;
  complianceEstimateId: string | null;
  plausibility: PlausibilityCheckResponse | null;
  regulatoryStatus: RegulatoryStatus;
  regulatoryRisk: RegulatoryRisk | null;
  regulatorySummary: string | null;
}

// ─── Forensics ───────────────────────────────────────────────────────────────

export type ForensicsCheckStatus = "PASS" | "FAIL" | "UNVERIFIABLE";
export type ForensicsStatus = "PENDING" | "PASS" | "FAIL" | "UNVERIFIABLE";

export interface ForensicsCheckResult {
  checkName: string;
  status: ForensicsCheckStatus;
  detail: string;
}

export interface FileForensicsResult {
  evidenceId: string;
  fileName: string;
  checks: ForensicsCheckResult[];
  overallStatus: ForensicsStatus;
  notes: string | null;
}

export interface EvidenceUploadResponse {
  checkId: string;
  filesProcessed: number;
  results: FileForensicsResult[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

// ─── Evidence types ──────────────────────────────────────────────────────────

export type EvidenceType =
  | "SITE_PHOTO"
  | "WEIGHBRIDGE_SLIP"
  | "INVOICE"
  | "REGISTRATION_CERTIFICATE"
  | "AUDIT_REPORT"
  | "OTHER";

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  SITE_PHOTO: "Site photo",
  WEIGHBRIDGE_SLIP: "Weighbridge slip",
  INVOICE: "Invoice",
  REGISTRATION_CERTIFICATE: "Registration certificate",
  AUDIT_REPORT: "Audit report",
  OTHER: "Other document",
};

export const EVIDENCE_TYPE_HINTS: Record<EvidenceType, string> = {
  SITE_PHOTO: "±7 days of processing date",
  WEIGHBRIDGE_SLIP: "±7 days of processing date",
  INVOICE: "±30 days of processing date",
  REGISTRATION_CERTIFICATE: "Must predate processing — any age",
  AUDIT_REPORT: "Must be from the same financial year",
  OTHER: "±30 days (default)",
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// ─── Vault (Module C1) ────────────────────────────────────────────────────────

export type VaultDocType =
  | "REGISTRATION_CERT"
  | "GST_CERT"
  | "PROCESSING_RECEIPT"
  | "OTHER";

export const VAULT_DOC_TYPE_LABELS: Record<VaultDocType, string> = {
  REGISTRATION_CERT: "Registration Certificate",
  GST_CERT: "GST Certificate",
  PROCESSING_RECEIPT: "Processing Receipt",
  OTHER: "Other Document",
};

export interface VaultDocTypeInfo {
  type: VaultDocType;
  label: string;
  description: string;
}

export interface VaultDocument {
  id: string;
  recyclerId: string;
  recyclerName: string;
  docType: VaultDocType;
  displayName: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  notes: string | null;
  consentAcceptedAt: string;
  uploadedAt: string;
}

export interface VaultConsentStatus {
  recyclerId: string;
  hasAccepted: boolean;
  acceptedAt: string | null;
}

// ─── Recyclers ────────────────────────────────────────────────────────────────

export interface RecyclerSummary {
  id: string;
  name: string;
  bwmrRegNumber: string | null;
  state: string | null;
}
