"use client";

import { CheckCircle, XCircle, HelpCircle, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { EvidenceSummaryDto, ForensicsStatus } from "@/lib/api/types";

interface Props {
  evidence: EvidenceSummaryDto[];
}

/**
 * Read-later view of evidence already uploaded — no per-sub-check breakdown (that only exists
 * transiently at upload time), just the persisted overall status and joined forensics notes.
 * Used when reopening a check outside the live wizard; see ForensicsResults for the live view.
 */
export function EvidenceSummaryList({ evidence }: Props) {
  const t = useTranslations("evidenceSummary");

  if (evidence.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[#444441]/50">{t("empty")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {evidence.map((ev) => (
        <Card key={ev.evidenceId} className="flex items-start gap-3">
          <StatusIcon status={ev.overallStatus} className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="h-3.5 w-3.5 text-[#444441]/40 shrink-0" />
              <p className="text-sm font-medium text-[#444441] truncate">{ev.fileName}</p>
              <span className="text-xs text-[#444441]/40">{ev.evidenceType.replace(/_/g, " ")}</span>
            </div>
            {ev.notes && (
              <p className="text-xs text-[#444441]/60 mt-1 leading-relaxed whitespace-pre-line">{ev.notes}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatusIcon({ status, className }: { status: ForensicsStatus; className?: string }) {
  const cls = cn("h-4 w-4", className);
  switch (status) {
    case "PASS":         return <CheckCircle className={cn(cls, "text-[#3B6D11]")} />;
    case "FAIL":         return <XCircle className={cn(cls, "text-[#A32D2D]")} />;
    default:              return <HelpCircle className={cn(cls, "text-[#854F0B]")} />;
  }
}
