"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { downloadReport } from "@/lib/api/checks";
import { StepIndicator } from "./StepIndicator";
import { RecyclerDetailsForm } from "./RecyclerDetailsForm";
import { EvidenceUpload } from "./EvidenceUpload";
import { ForensicsResults } from "./ForensicsResults";
import { PlausibilityResults } from "./PlausibilityResults";
import { RegulatoryHistory } from "./RegulatoryHistory";
import type { EvidenceUploadResponse, VerificationCheckResponse } from "@/lib/api/types";

export function VerifyFlow() {
  const t = useTranslations("verify");
  const STEPS = [t("steps.recyclerDetails"), t("steps.uploadEvidence"), t("steps.results")];
  const { token } = useAuth();
  const params    = useSearchParams();
  const estimateId = params.get("estimateId") ?? undefined;

  const [step,             setStep]             = useState(0);
  const [check,            setCheck]            = useState<VerificationCheckResponse | null>(null);
  const [forensicsResult,  setForensicsResult]  = useState<EvidenceUploadResponse | null>(null);
  const [downloading,      setDownloading]      = useState(false);
  const [downloadError,    setDownloadError]    = useState<string | null>(null);

  // Gate: require login
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex rounded-full bg-[#0F6E56]/10 p-4 mb-6">
          <ShieldCheck className="h-10 w-10 text-[#0F6E56]" />
        </div>
        <h1 className="text-2xl font-bold text-[#444441] mb-3">{t("signInTitle")}</h1>
        <p className="text-[#444441]/70 mb-8 leading-relaxed">
          {t("signInBody")}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="primary">{t("login")}</Button></Link>
          <Link href="/register"><Button variant="outline">{t("signupFree")}</Button></Link>
        </div>
      </div>
    );
  }

  function reset() {
    setCheck(null);
    setForensicsResult(null);
    setStep(0);
  }

  async function handleDownloadReport() {
    if (!check || !token) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadReport(check.id, token);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#444441]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[#444441]/60">
          {t("subtitle")}
        </p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      {step === 0 && (
        <RecyclerDetailsForm
          token={token}
          estimateId={estimateId}
          onCreated={(c) => { setCheck(c); setStep(1); }}
        />
      )}

      {step === 1 && check && (
        <EvidenceUpload
          check={check}
          token={token}
          onComplete={(r) => { setForensicsResult(r); setStep(2); }}
        />
      )}

      {step === 2 && forensicsResult && check && (
        <div className="space-y-6">
          {/* Header + report download */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#444441]">{t("results.heading")}</h2>
              <p className="text-sm text-[#444441]/60 mt-0.5">
                {check.recyclerName} · {check.batchWeightTonnes} T · {check.processingDate}
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 flex items-center gap-1.5 text-xs"
              onClick={handleDownloadReport}
              disabled={downloading}
            >
              <Download className="h-3.5 w-3.5" />
              {downloading ? t("results.downloading") : t("results.downloadPdf")}
            </Button>
          </div>
          {downloadError && (
            <p className="text-xs text-[#A32D2D]">{downloadError}</p>
          )}

          {/* Plausibility */}
          {check.plausibility && (
            <section>
              <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
                {t("results.batchPlausibility")}
              </h3>
              <PlausibilityResults result={check.plausibility} />
            </section>
          )}

          {/* Document forensics */}
          <section>
            <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
              {t("results.documentForensics")}
            </h3>
            <ForensicsResults result={forensicsResult} onRunAnother={reset} />
          </section>

          {/* Regulatory history — triggered by user, polled async */}
          <section>
            <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
              {t("results.regulatoryHistory")}
            </h3>
            <RegulatoryHistory
              checkId={check.id}
              token={token}
              initialStatus={check.regulatoryStatus}
            />
          </section>
        </div>
      )}
    </div>
  );
}
