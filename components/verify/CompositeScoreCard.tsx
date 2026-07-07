"use client";

import { AlertOctagon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CompositeScoreBreakdown, RiskRating } from "@/lib/api/types";

interface Props {
  compositeScore: number | null;
  breakdown: CompositeScoreBreakdown | null;
  hardDisqualified: boolean;
  hardDisqualificationReason: string | null;
  riskRating: RiskRating | null;
  riskSummary: string | null;
}

export function CompositeScoreCard({
  compositeScore,
  breakdown,
  hardDisqualified,
  hardDisqualificationReason,
  riskRating,
  riskSummary,
}: Props) {
  const t = useTranslations("compositeScore");

  if (compositeScore === null) {
    return (
      <Card>
        <p className="text-sm text-[#444441]/50">{t("notYetComputed")}</p>
      </Card>
    );
  }

  const { bg, border, text } = ratingMeta(riskRating);

  return (
    <Card className={cn("border", border, bg)}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide">{t("heading")}</p>
          <p className={cn("text-3xl font-bold mt-1", text)}>
            {compositeScore}
            <span className="text-sm font-normal text-[#444441]/40"> / 100</span>
          </p>
        </div>
        <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-semibold self-start", bg, text)}>
          {riskRating ? t(`band.${riskRating}`) : t("bandPending")}
        </span>
      </div>

      {hardDisqualified && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-[#A32D2D]/10 border border-[#A32D2D]/30 px-3 py-2">
          <AlertOctagon className="h-4 w-4 text-[#A32D2D] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#A32D2D]">{t("hardDisqualified")}</p>
            <p className="text-xs text-[#A32D2D]/90 mt-0.5">{hardDisqualificationReason}</p>
          </div>
        </div>
      )}

      {riskSummary && (
        <p className="text-sm text-[#444441]/70 mt-3 leading-relaxed">{riskSummary}</p>
      )}

      {breakdown && (
        <div className="mt-4 pt-4 border-t border-black/5 space-y-2">
          <p className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            {t("breakdownHeading")}
          </p>
          <SubScoreBar label={t("layer.registration")} score={breakdown.registrationSubScore} />
          <SubScoreBar label={t("layer.capacity")} score={breakdown.capacitySubScore} />
          <SubScoreBar label={t("layer.invoice")} score={breakdown.invoiceSubScore} />
          <SubScoreBar label={t("layer.forensics")} score={breakdown.forensicsSubScore} />
          <SubScoreBar label={t("layer.regulatory")} score={breakdown.regulatorySubScore} />
        </div>
      )}
    </Card>
  );
}

function SubScoreBar({ label, score }: { label: string; score: number | null }) {
  const pct = score ?? 50;
  const barColor = pct <= 30 ? "bg-[#3B6D11]" : pct <= 60 ? "bg-[#854F0B]" : "bg-[#A32D2D]";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#444441]/60 w-40 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div className={cn("h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#444441]/40 w-16 text-right shrink-0">
        {score === null ? "—" : `${score} / 100`}
      </span>
    </div>
  );
}

function ratingMeta(rating: RiskRating | null) {
  switch (rating) {
    case "LOW":      return { bg: "bg-[#3B6D11]/5",  border: "border-[#3B6D11]/30",  text: "text-[#3B6D11]" };
    case "MEDIUM":   return { bg: "bg-[#854F0B]/5",  border: "border-[#854F0B]/30",  text: "text-[#854F0B]" };
    case "HIGH":     return { bg: "bg-[#A32D2D]/5",  border: "border-[#A32D2D]/30",  text: "text-[#A32D2D]" };
    case "CRITICAL": return { bg: "bg-[#A32D2D]/10", border: "border-[#A32D2D]/50",  text: "text-[#A32D2D]" };
    default:         return { bg: "bg-black/5",      border: "border-black/10",      text: "text-[#444441]/50" };
  }
}
