"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { getCheck, getEvidenceSummaries } from "@/lib/api/checks";
import { CheckResults } from "@/components/verify/CheckResults";
import type { EvidenceSummaryDto, VerificationCheckResponse } from "@/lib/api/types";

export default function CheckDetailPage({ params }: { params: Promise<{ checkId: string }> }) {
  const { checkId } = use(params);
  const t = useTranslations("verify");
  const { token } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [check, setCheck] = useState<VerificationCheckResponse | null>(null);
  const [evidence, setEvidence] = useState<EvidenceSummaryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated || !token) return;
    setLoading(true);
    setError(null);
    Promise.all([getCheck(checkId, token), getEvidenceSummaries(checkId, token)])
      .then(([checkResult, evidenceResult]) => {
        setCheck(checkResult);
        setEvidence(evidenceResult);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load check"))
      .finally(() => setLoading(false));
  }, [hydrated, token, checkId]);

  if (!hydrated) return null;

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex rounded-full bg-[#0F6E56]/10 p-4 mb-6">
          <ShieldCheck className="h-10 w-10 text-[#0F6E56]" />
        </div>
        <h1 className="text-2xl font-bold text-[#444441] mb-3">{t("signInTitle")}</h1>
        <p className="text-[#444441]/70 mb-8 leading-relaxed">{t("signInBody")}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="primary">{t("login")}</Button></Link>
          <Link href="/register"><Button variant="outline">{t("signupFree")}</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 flex justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#0F6E56] border-t-transparent" />
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
          {error ?? "Check not found"}
        </p>
        <Link href="/checks" className="inline-block mt-4">
          <Button variant="outline">Back to checks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#444441]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[#444441]/60">{t("subtitle")}</p>
      </div>
      <CheckResults check={check} token={token} evidenceSummaries={evidence} />
    </div>
  );
}
