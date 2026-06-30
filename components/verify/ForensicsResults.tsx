"use client";

import { CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { getExplanation } from "@/lib/forensicsExplanations";
import type {
  EvidenceUploadResponse,
  FileForensicsResult,
  ForensicsCheckStatus,
  ForensicsStatus,
} from "@/lib/api/types";

interface Props {
  result: EvidenceUploadResponse;
  onRunAnother: () => void;
}

export function ForensicsResults({ result, onRunAnother }: Props) {
  const failCount = result.results.filter((r) => r.overallStatus === "FAIL").length;
  const passCount = result.results.filter((r) => r.overallStatus === "PASS").length;
  const unverifiableCount = result.results.filter((r) => r.overallStatus === "UNVERIFIABLE").length;

  return (
    <div className="space-y-4">
      {/* Overall summary */}
      <Card
        className={cn(
          "border",
          failCount > 0
            ? "border-[#A32D2D]/30 bg-[#A32D2D]/5"
            : passCount === result.results.length
            ? "border-[#3B6D11]/30 bg-[#3B6D11]/5"
            : "border-[#854F0B]/30 bg-[#854F0B]/5"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-[#444441]">Forensics complete</h2>
            <p className="text-sm text-[#444441]/70 mt-1">
              {result.filesProcessed} file{result.filesProcessed !== 1 ? "s" : ""} processed
              {passCount > 0 && (
                <> · <span className="text-[#3B6D11] font-medium">{passCount} passed</span></>
              )}
              {failCount > 0 && (
                <> · <span className="text-[#A32D2D] font-medium">{failCount} failed</span></>
              )}
              {unverifiableCount > 0 && (
                <> · <span className="text-[#854F0B] font-medium">{unverifiableCount} unverifiable</span></>
              )}
            </p>
          </div>
          <StatusIcon
            status={failCount > 0 ? "FAIL" : passCount === result.results.length ? "PASS" : "UNVERIFIABLE"}
            size="lg"
          />
        </div>
      </Card>

      {/* Per-file results */}
      {result.results.map((fileResult) => (
        <FileResult key={fileResult.evidenceId} result={fileResult} />
      ))}

      <Button variant="outline" onClick={onRunAnother} className="w-full">
        Start a new check
      </Button>
    </div>
  );
}

function FileResult({ result }: { result: FileForensicsResult }) {
  const [expanded, setExpanded] = useState(result.overallStatus !== "PASS");

  return (
    <Card>
      {/* File header — always visible */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon status={result.overallStatus} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#444441] truncate">{result.fileName}</p>
            <p className="text-xs text-[#444441]/50">
              {result.checks.length} check{result.checks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-[#444441]/40 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-[#444441]/40 shrink-0" />}
      </button>

      {/* Expanded check list */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
          {result.checks.map((check, i) => {
            const explanation = getExplanation(check.checkName);
            return (
              <div key={i} className="flex items-start gap-3">
                <StatusIcon status={check.status} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  {/* Check name + ⓘ tooltip */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-[#444441]">{check.checkName}</p>
                    {explanation && (
                      <Tooltip content={explanation}>
                        <button
                          className="text-[#444441]/30 hover:text-[#0F6E56] transition-colors focus:outline-none"
                          aria-label={`What does "${check.checkName}" check?`}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                  {/* Result detail */}
                  <p className="text-xs text-[#444441]/60 mt-0.5 leading-relaxed">
                    {check.detail}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Failure summary notes */}
          {result.notes && (
            <div className="mt-2 rounded-md bg-[#854F0B]/5 border border-[#854F0B]/20 px-3 py-2">
              <p className="text-xs text-[#854F0B] leading-relaxed whitespace-pre-line">
                {result.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function StatusIcon({
  status,
  size = "sm",
  className,
}: {
  status: ForensicsStatus | ForensicsCheckStatus;
  size?: "sm" | "lg";
  className?: string;
}) {
  const cls = cn(size === "lg" ? "h-6 w-6" : "h-4 w-4", className);
  if (status === "PASS") return <CheckCircle className={cn(cls, "text-[#3B6D11]")} />;
  if (status === "FAIL") return <XCircle className={cn(cls, "text-[#A32D2D]")} />;
  return <HelpCircle className={cn(cls, "text-[#854F0B]")} />;
}
