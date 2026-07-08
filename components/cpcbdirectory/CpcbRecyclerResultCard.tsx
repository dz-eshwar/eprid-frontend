"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { RiskPill } from "@/components/verify/RiskPill";
import { cn } from "@/lib/utils";
import type { CpcbRecyclerSearchResult } from "@/lib/api/types";

interface Props {
  result: CpcbRecyclerSearchResult;
}

export function CpcbRecyclerResultCard({ result }: Props) {
  const t = useTranslations("cpcbDirectory");
  const [expanded, setExpanded] = useState(false);
  const score = result.latestScore;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#444441]">{result.recyclerName}</p>
            {result.cpcbId && (
              <span className="text-xs text-[#444441]/40">CPCB #{result.cpcbId}</span>
            )}
          </div>
          {result.recyclerAddress && (
            <p className="text-xs text-[#444441]/60 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" /> {result.recyclerAddress}
            </p>
          )}
          {result.recyclerGstNo && (
            <p className="text-xs text-[#444441]/40 mt-0.5">GST: {result.recyclerGstNo}</p>
          )}
        </div>
        <RiskPill rating={score?.riskBand ?? null} />
      </div>

      {result.authorizations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {result.authorizations.map((a) => (
            <span
              key={a.categoryCode}
              className="text-xs px-2 py-0.5 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] font-medium"
              title={a.categoryLabel}
            >
              {a.categoryCode}
            </span>
          ))}
        </div>
      )}

      {result.dataQualityPartialCapture && (
        <div className="flex items-start gap-2 mt-3 rounded-md bg-[#854F0B]/5 border border-[#854F0B]/20 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-[#854F0B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#854F0B]/90">{t("partialCaptureNotice")}</p>
        </div>
      )}

      {score && (
        <div className="mt-3">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setExpanded((e) => !e)}
          >
            <span className="text-xs font-medium text-[#444441]/70">
              {t("compositeScore", { score: score.compositeScore })}
            </span>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-[#444441]/40" />
              : <ChevronDown className="h-4 w-4 text-[#444441]/40" />}
          </button>
          <p className="text-[10px] text-[#444441]/40 mt-0.5">{t("scoreDirectionNote")}</p>

          {expanded && (
            <div className="mt-3 space-y-3 border-t border-black/5 pt-3">
              {score.flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#A32D2D] mb-1">{t("flags")}</p>
                  <ul className="space-y-1">
                    {score.flags.map((f, i) => (
                      <li key={i} className="text-xs text-[#444441]/70 flex gap-1.5">
                        <span className="text-[#A32D2D]">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {score.unassessed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#854F0B] mb-1">{t("unassessed")}</p>
                  <ul className="space-y-1">
                    {score.unassessed.map((u, i) => (
                      <li key={i} className={cn("text-xs text-[#444441]/50 flex gap-1.5")}>
                        <span className="text-[#854F0B]">•</span> {u}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {score.flags.length === 0 && score.unassessed.length === 0 && (
                <p className="text-xs text-[#3B6D11]">{t("noIssues")}</p>
              )}
              <p className="text-xs text-[#444441]/30">
                {t("scoreConfidenceNote")}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
