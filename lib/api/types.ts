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
  // Module A0 — optional recycler KYC fields, all optional. Helps verify the account faster
  // but never blocks registration.
  gstin?: string;
  legalName?: string;
  udyamNumber?: string;
  cinOrDin?: string;
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

// ─── Waste stream (Module D) ──────────────────────────────────────────────────

export type WasteStreamType = "BATTERY" | "TYRE" | "USED_OIL";

// Tyre EPR certificate-generation formula (QEPR = QP × CF × WP, PRD §7.5) — end-product
// category selects CF/WP from CPCB's table. Supersedes the earlier TPO-yield-ratio benchmark.
export type TyreEndProduct =
  | "CRUMB_RUBBER"
  | "RECLAIMED_RUBBER"
  | "CRMB"
  | "RECOVERED_CARBON_BLACK"
  | "PYROLYSIS_OIL_CONTINUOUS"
  | "CHAR_BATCH";

export const TYRE_END_PRODUCT_LABELS: Record<TyreEndProduct, string> = {
  CRUMB_RUBBER: "Crumb rubber",
  RECLAIMED_RUBBER: "Reclaimed rubber",
  CRMB: "Crumb rubber modified bitumen (CRMB)",
  RECOVERED_CARBON_BLACK: "Recovered carbon black",
  PYROLYSIS_OIL_CONTINUOUS: "Pyrolysis oil (continuous process)",
  CHAR_BATCH: "Char (batch process)",
};

// ─── Verification Checks ─────────────────────────────────────────────────────

export type CheckStatus = "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
export type RiskRating = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface CreateCheckRequest {
  recyclerName: string;
  bwmrRegNumber?: string;
  recyclerState?: string;
  recyclerSelfReportedCapacityT?: number;
  producerName: string;
  cpcbRegNumber?: string;
  wasteStream?: WasteStreamType; // defaults to BATTERY server-side
  batchWeightTonnes: number;
  claimedRecoveryPct: number;
  claimedOutputQuantity?: number; // tyre only: QP, quantity of end-product sold (unit depends on tyreEndProduct)
  tyreEndProduct?: TyreEndProduct; // tyre only: selects CF/WP from CPCB's table (§7.5)
  tyreImported?: boolean; // tyre only: true if the underlying waste tyre was imported (forces WP = 1.0)
  claimedEprCreditKg?: number; // tyre only: claimed EPR certificate credit (kg), reconciled against QEPR = QP × CF × WP
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
  wasteStream: WasteStreamType;
  batchWeightTonnes: number;
  claimedRecoveryPct: number;
  claimedOutputQuantity: number | null;
  tyreEndProduct: TyreEndProduct | null;
  tyreImported: boolean;
  claimedEprCreditKg: number | null;
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
  // Composite risk scoring (§7.1a) — recomputed as plausibility/evidence/regulatory history
  // each complete, so early in a check's life these reflect signals that haven't run yet
  compositeScore: number | null;
  compositeScoreBreakdown: CompositeScoreBreakdown | null;
  hardDisqualified: boolean;
  hardDisqualificationReason: string | null;
}

export interface CompositeScoreBreakdown {
  registrationSubScore: number | null;
  capacitySubScore: number | null;
  invoiceSubScore: number | null;
  forensicsSubScore: number | null;
  regulatorySubScore: number | null;
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

/** Read-later summary for evidence already uploaded — used when reopening a check outside the
 *  upload flow. No per-sub-check breakdown, only the joined forensics notes text. */
export interface EvidenceSummaryDto {
  evidenceId: string;
  fileName: string;
  evidenceType: string;
  overallStatus: ForensicsStatus;
  notes: string | null;
  uploadedAt: string;
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

// ─── Used Oil (Module E) ──────────────────────────────────────────────────────

export type UsedOilTier = "CA_1" | "CA_2";

export interface TierDeterminationRequest {
  hasStorageFacility: boolean;
  hasTruckFleet: boolean;
}

export interface TierDeterminationResponse {
  tier: UsedOilTier;
  rationale: string;
}

export interface Ca1PrerequisiteCheckRequest {
  hasSignedAgreementWithCa2OrRecycler: boolean;
}

export interface Ca1PrerequisiteCheckResponse {
  canProceed: boolean;
  message: string;
  requiredAgreementContents: string[];
}

export interface ReadinessChecklistItem {
  label: string;
  description: string;
}

export interface Ca2ReadinessChecklistResponse {
  items: ReadinessChecklistItem[];
}

export interface FeeCalculationRequest {
  avgAnnualQuantityMt: number;
}

export interface FeeCalculationResponse {
  registrationFeeRs: number;
  annualProcessingChargeRs: number;
  totalFirstYearRs: number;
  tierLabel: string;
}

export interface Ca1FormChecklistResponse {
  sections: string[];
  agreementUploadNote: string;
  maxAgreementFileSizeMb: number;
}

export interface Ca1ApplicationDetails {
  authorizedPersonName?: string;
  authorizedPersonDesignation?: string;
  authorizedPersonMobile?: string;
  authorizedPersonEmail?: string;
  vehicleRegistrationNumber?: string;
  vehicleType?: string;
  vehicleCapacityKl?: number;
  collectionAreas?: string;
  estimatedMonthlyCollectionKl?: number;
}

export interface Ca2ApplicationDetails {
  authorizedPersonName?: string;
  authorizedPersonDesignation?: string;
  authorizedPersonMobile?: string;
  authorizedPersonEmail?: string;
  storageFacilityAddress?: string;
  storageCapacityKl?: number;
  gstNumber?: string;
  labFacilityDetails?: string;
  attachedCa1sOrRecyclers?: string;
}

export interface UsedOilSummaryRequest {
  tier: UsedOilTier;
  avgAnnualQuantityMt: number;
  ca1PrerequisiteMet?: boolean | null;
  ca1ApplicationDetails?: Ca1ApplicationDetails;
  ca2ApplicationDetails?: Ca2ApplicationDetails;
}

export interface UsedOilSummaryResponse {
  tier: UsedOilTier;
  feeBreakdown: FeeCalculationResponse;
  prerequisitesMet: string[];
  prerequisitesOutstanding: string[];
  nextStep: string;
  disclaimer: string;
}

// ─── Credential/KYC checks (Module A0) ────────────────────────────────────────

export type CredentialCheckType =
  | "GST_VERIFICATION"
  | "GST_OTP_VERIFICATION"
  | "UDYAM_VERIFICATION"
  | "MCA_VERIFICATION";

export type CredentialCheckResult = "PASS" | "FAIL" | "COULD_NOT_VERIFY";

export interface CredentialCheckOutcomeDto {
  checkType: CredentialCheckType;
  result: CredentialCheckResult;
  provider: string;
  reason: string | null;
  checkedAt: string;
}

// ─── CPCB Recycler Directory (Entity Health Score) ────────────────────────────
// Public CPCB battery-recycler registry, scored on registration/authorization/geography only —
// not the full Certificate Risk Score (that needs certificate-volume/invoice data this source
// doesn't have). See product_document_built_state.md.

export interface CpcbAuthorizationDto {
  categoryCode: string;
  categoryLabel: string;
}

export type ScoreConfidence = "ENTITY_HEALTH" | "CERTIFICATE_RISK";

export interface CpcbRecyclerScoreDto {
  compositeScore: number;
  riskBand: RiskRating;
  flags: string[];
  unassessed: string[];
  layerBreakdown: Record<string, unknown>;
  scoreConfidence: ScoreConfidence;
  scoredAt: string;
}

export interface CpcbRecyclerSearchResult {
  id: string;
  cpcbId: string | null;
  recyclerName: string;
  recyclerAddress: string | null;
  stateId: string | null;
  recyclerGstNo: string | null;
  consentAirExpiry: string | null;
  consentWaterExpiry: string | null;
  hwmdValidExpiry: string | null;
  dicValidExpiry: string | null;
  recyclingCapacity: number | null;
  latitude: number | null;
  longitude: number | null;
  authorizations: CpcbAuthorizationDto[];
  dataQualityPartialCapture: boolean;
  dataQualityNotes: string | null;
  latestScore: CpcbRecyclerScoreDto | null;
}

export interface CpcbIngestionSummaryDto {
  rowsRead: number;
  rowsUpserted: number;
  rowsFlaggedPartialCapture: number;
  rowsMissingSourceId: number;
  errors: string[];
}
