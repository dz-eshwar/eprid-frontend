"use client";

import {
  ShieldCheck, ShieldAlert, ShieldX, Shield, Loader2,
  ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { triggerRegulatoryHistory, getRegulatoryHistory } from "@/lib/api/checks";
import type {
  RegulatoryHistoryResponse,
  RegulatoryRisk,
  RegulatoryStatus,
} from "@/lib/api/types";

interface Props {
  checkId: string;
  token: string;
  /** Pre-seeded status from the check response (avoids an extra GET on mount) */
  initialStatus?: RegulatoryStatus;
}

export function RegulatoryHistory({ checkId, token, initialStatus = "NOT_STARTED" }: Props) {
  const [status,   setStatus]   = useState<RegulatoryStatus>(initialStatus);
  const [result,   setResult]   = useState<RegulatoryHistoryResponse | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const fetchResult = useCallback(async () => {
    try {
      const res = await getRegulatoryHistory(checkId, token);
      setResult(res);
      setStatus(res.status);
      if (res.status === "COMPLETE" || res.status === "FAILED") {
        stopPolling();
      }
    } catch {
      // silently ignore polling errors — will retry on next interval
    }
  }, [checkId, token, stopPolling]);

  // Start research + poll until done
  const start = useCallback(async () => {
    setStatus("PENDING");
    setError(null);
    try {
      await triggerRegulatoryHistory(checkId, token);
    } catch {
      setError("Failed to start regulatory research. Please try again.");
      setStatus("NOT_STARTED");
      return;
    }
    // Poll every 4 seconds
    pollRef.current = setInterval(fetchResult, 4000);
  }, [checkId, token, fetchResult]);

  // If already pending/complete on mount, fetch immediately then poll if needed
  useEffect(() => {
    if (initialStatus === "PENDING") {
      fetchResult();
      pollRef.current = setInterval(fetchResult, 4000);
    } else if (initialStatus === "COMPLETE" || initialStatus === "FAILED") {
      fetchResult();
    }
    return stopPolling;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const riskLabel = result?.overallRisk;
  const { icon: RiskIcon, color, bg, border, label } = riskMeta(riskLabel ?? null, status);

  return (
    <Card className={cn("border", border, bg)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {status === "PENDING"
            ? <Loader2 className="h-5 w-5 text-[#854F0B] animate-spin shrink-0" />
            : <RiskIcon className={cn("h-5 w-5 shrink-0", color)} />}
          <div>
            <p className="font-semibold text-[#444441]">Regulatory history</p>
            <p className="text-xs text-[#444441]/60 mt-0.5">{label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "NOT_STARTED" && (
            <Button variant="outline" onClick={start}>
              Run check
            </Button>
          )}
          {(status === "COMPLETE" || status === "FAILED") && result && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-[#444441]/40 hover:text-[#444441]"
            >
              {expanded
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-[#A32D2D]">{error}</p>
      )}

      {/* Results */}
      {expanded && result && (status === "COMPLETE" || status === "FAILED") && (
        <div className="mt-4 space-y-4 border-t border-black/5 pt-4">
          {/* Rationale */}
          {result.rationale && (
            <p className="text-sm text-[#444441]/80 leading-relaxed">{result.rationale}</p>
          )}

          {/* Findings list */}
          {result.findings.length > 0 && (
            <div className="space-y-3">
              {result.findings.map((f) => (
                <div key={f.id} className={cn(
                  "rounded-lg border px-3 py-2.5",
                  severityBorder(f.severity)
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#444441]">{f.title}</p>
                      <p className="text-xs text-[#444441]/50 mt-0.5">
                        {f.source} · {f.findingType.replace(/_/g, " ")}
                        {f.findingDate ? ` · ${f.findingDate}` : ""}
                        {" · "}
                        <span className="opacity-70">confidence: {f.confidence.toLowerCase()}</span>
                      </p>
                    </div>
                    {f.url && (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[#0F6E56] hover:opacity-70"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#444441]/60 mt-1.5 leading-relaxed">{f.summary}</p>
                </div>
              ))}
            </div>
          )}

          {/* Caveat */}
          {result.caveat && (
            <p className="text-xs text-[#444441]/40 border-t border-black/5 pt-3 leading-relaxed">
              {result.caveat}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function riskMeta(risk: RegulatoryRisk | null, status: RegulatoryStatus) {
  if (status === "NOT_STARTED") return {
    icon: Shield, color: "text-[#444441]/30", bg: "", border: "border-black/10",
    label: "No regulatory research has been run yet. Click 'Run check' to start.",
  };
  if (status === "PENDING") return {
    icon: Loader2, color: "text-[#854F0B]", bg: "bg-[#854F0B]/5", border: "border-[#854F0B]/30",
    label: "Researching CPCB enforcement records, NGT orders, and news…",
  };
  if (status === "FAILED") return {
    icon: Shield, color: "text-[#444441]/40", bg: "", border: "border-black/10",
    label: "Research could not be completed — API key may not be configured.",
  };

  switch (risk) {
    case "HIGH":    return { icon: ShieldX,     color: "text-[#A32D2D]", bg: "bg-[#A32D2D]/5", border: "border-[#A32D2D]/30", label: "High regulatory risk — review findings." };
    case "MEDIUM":  return { icon: ShieldAlert,  color: "text-[#854F0B]", bg: "bg-[#854F0B]/5", border: "border-[#854F0B]/30", label: "Medium regulatory risk — some findings of note." };
    case "LOW":     return { icon: ShieldCheck,  color: "text-[#3B6D11]", bg: "bg-[#3B6D11]/5", border: "border-[#3B6D11]/30", label: "Low regulatory risk — no significant enforcement history found." };
    default:        return { icon: Shield,        color: "text-[#444441]/40", bg: "",              border: "border-black/10",      label: "Risk level unknown — insufficient data." };
  }
}

function severityBorder(severity: string) {
  switch (severity) {
    case "HIGH":   return "border-[#A32D2D]/30 bg-[#A32D2D]/5";
    case "MEDIUM": return "border-[#854F0B]/30 bg-[#854F0B]/5";
    case "LOW":    return "border-[#3B6D11]/30 bg-[#3B6D11]/5";
    default:       return "border-black/10 bg-black/[0.02]";
  }
}
