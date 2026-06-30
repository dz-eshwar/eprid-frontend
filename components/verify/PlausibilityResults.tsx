"use client";

import { CheckCircle, XCircle, HelpCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { PlausibilityCheckResponse, SubCheckStatus } from "@/lib/api/types";

interface Props {
  result: PlausibilityCheckResponse;
  /** If true, show expanded detail rows by default */
  defaultExpanded?: boolean;
}

export function PlausibilityResults({ result, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded || result.overallStatus !== "PASS");

  const { bg, border, label } = statusMeta(result.overallStatus);

  return (
    <Card className={cn("border", border, bg)}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <SubCheckIcon status={result.overallStatus} size="lg" />
          <div>
            <p className="font-semibold text-[#444441]">Batch plausibility check</p>
            <p className="text-xs text-[#444441]/60 mt-0.5">{label}</p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-[#444441]/40 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-[#444441]/40 shrink-0" />}
      </button>

      {/* Sub-check rows */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
          {result.subChecks.map((sub, i) => (
            <div key={i} className="flex items-start gap-3">
              <SubCheckIcon status={sub.status} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-medium text-[#444441]">{sub.name}</p>
                  {sub.referenceValue && (
                    <span className="text-xs text-[#444441]/40 shrink-0">{sub.referenceValue}</span>
                  )}
                </div>
                <p className="text-xs text-[#444441]/60 mt-0.5 leading-relaxed">{sub.detail}</p>
              </div>
            </div>
          ))}

          {/* Caveat */}
          <p className="text-xs text-[#444441]/40 border-t border-black/5 pt-3 leading-relaxed">
            {result.caveat}
          </p>
        </div>
      )}
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusMeta(status: SubCheckStatus) {
  switch (status) {
    case "PASS":
      return {
        bg: "bg-[#3B6D11]/5",
        border: "border-[#3B6D11]/30",
        label: "All batch details are within plausible industry ranges.",
      };
    case "WARN":
      return {
        bg: "bg-[#854F0B]/5",
        border: "border-[#854F0B]/30",
        label: "Some batch details are unusual — review the findings below.",
      };
    case "FAIL":
      return {
        bg: "bg-[#A32D2D]/5",
        border: "border-[#A32D2D]/30",
        label: "One or more batch details appear implausible — this check has failed.",
      };
    case "UNVERIFIABLE":
      return {
        bg: "bg-[#854F0B]/5",
        border: "border-[#854F0B]/30",
        label: "Some checks could not be verified — additional data is needed.",
      };
  }
}

function SubCheckIcon({
  status,
  size = "sm",
  className,
}: {
  status: SubCheckStatus;
  size?: "sm" | "lg";
  className?: string;
}) {
  const cls = cn(size === "lg" ? "h-5 w-5" : "h-4 w-4", className);
  switch (status) {
    case "PASS":         return <CheckCircle   className={cn(cls, "text-[#3B6D11]")} />;
    case "FAIL":         return <XCircle       className={cn(cls, "text-[#A32D2D]")} />;
    case "WARN":         return <AlertTriangle className={cn(cls, "text-[#854F0B]")} />;
    case "UNVERIFIABLE": return <HelpCircle    className={cn(cls, "text-[#854F0B]")} />;
  }
}
