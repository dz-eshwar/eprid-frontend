"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { StepIndicator } from "./StepIndicator";
import { RecyclerDetailsForm } from "./RecyclerDetailsForm";
import { EvidenceUpload } from "./EvidenceUpload";
import { CheckResults } from "./CheckResults";
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
        <CheckResults
          check={check}
          token={token}
          forensicsResult={forensicsResult}
          onRunAnother={reset}
        />
      )}
    </div>
  );
}
