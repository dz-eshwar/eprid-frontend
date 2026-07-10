"use client";

import { CheckCircle, XCircle, HelpCircle, AlertOctagon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { BATTERY_METAL_LABELS } from "@/lib/api/types";
import type { CompositionCheckResult, MetalCompositionCheckDto } from "@/lib/api/types";

interface Props {
  checks: MetalCompositionCheckDto[];
  defaultExpanded?: boolean;
}

/**
 * Per-metal composition-table check results (feature_spec_close_scoring_gaps.md §1). A
 * ZERO_CELL_VIOLATION reads visually distinct from a soft FAIL — it's chemistry-impossible
 * (and hard-disqualifies), not just out of range — matching the same red-callout treatment
 * CompositeScoreCard uses for hardDisqualified, rather than the ordinary red row styling FAIL gets.
 */
export function CompositionCheckResults({ checks, defaultExpanded = false }: Props) {
  const t = useTranslations("compositionResults");
  const hasIssue = checks.some((c) => c.result === "FAIL" || c.result === "ZERO_CELL_VIOLATION");
  const [expanded, setExpanded] = useState(defaultExpanded || hasIssue);

  if (checks.length === 0) return null;

  const worst = worstResult(checks);
  const { bg, border } = statusMeta(worst);

  return (
    <Card className={cn("border", border, bg)}>
      <button
        className="w-full flex items-center justify-between gap-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <ResultIcon result={worst} size="lg" />
          <div>
            <p className="font-semibold text-[#444441]">{t("heading")}</p>
            <p className="text-xs text-[#444441]/60 mt-0.5">{t(`summary.${worst}`)}</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-[#444441]/40 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-[#444441]/40 shrink-0" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-2 border-t border-black/5 pt-4">
          {checks.map((c) =>
            c.result === "ZERO_CELL_VIOLATION" ? (
              <div
                key={c.metal}
                className="flex items-start gap-2 rounded-md bg-[#A32D2D]/10 border border-[#A32D2D]/30 px-3 py-2"
              >
                <AlertOctagon className="h-4 w-4 text-[#A32D2D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#A32D2D]">
                    {BATTERY_METAL_LABELS[c.metal]} — {t("chemistryImpossible")}
                  </p>
                  <p className="text-xs text-[#A32D2D]/90 mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ) : (
              <div key={c.metal} className="flex items-start gap-3">
                <ResultIcon result={c.result} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#444441]">{BATTERY_METAL_LABELS[c.metal]}</p>
                    <span className="text-xs text-[#444441]/40 shrink-0">
                      {c.expectedMin}–{c.expectedMax}%
                    </span>
                  </div>
                  <p className="text-xs text-[#444441]/60 mt-0.5 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function worstResult(checks: MetalCompositionCheckDto[]): CompositionCheckResult {
  if (checks.some((c) => c.result === "ZERO_CELL_VIOLATION")) return "ZERO_CELL_VIOLATION";
  if (checks.some((c) => c.result === "FAIL")) return "FAIL";
  if (checks.some((c) => c.result === "COULD_NOT_VERIFY")) return "COULD_NOT_VERIFY";
  return "PASS";
}

function statusMeta(result: CompositionCheckResult) {
  switch (result) {
    case "PASS":
      return { bg: "bg-[#3B6D11]/5", border: "border-[#3B6D11]/30" };
    case "COULD_NOT_VERIFY":
      return { bg: "bg-[#854F0B]/5", border: "border-[#854F0B]/30" };
    case "FAIL":
      return { bg: "bg-[#A32D2D]/5", border: "border-[#A32D2D]/30" };
    case "ZERO_CELL_VIOLATION":
      return { bg: "bg-[#A32D2D]/10", border: "border-[#A32D2D]/50" };
  }
}

function ResultIcon({
  result,
  size = "sm",
  className,
}: {
  result: CompositionCheckResult;
  size?: "sm" | "lg";
  className?: string;
}) {
  const cls = cn(size === "lg" ? "h-5 w-5" : "h-4 w-4", className);
  switch (result) {
    case "PASS":                return <CheckCircle   className={cn(cls, "text-[#3B6D11]")} />;
    case "FAIL":                return <XCircle       className={cn(cls, "text-[#A32D2D]")} />;
    case "ZERO_CELL_VIOLATION": return <AlertOctagon  className={cn(cls, "text-[#A32D2D]")} />;
    case "COULD_NOT_VERIFY":    return <HelpCircle    className={cn(cls, "text-[#854F0B]")} />;
  }
}
