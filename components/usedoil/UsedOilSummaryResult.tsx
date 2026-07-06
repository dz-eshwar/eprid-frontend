"use client";

import { useState } from "react";
import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { UsedOilSummaryRequest, UsedOilSummaryResponse } from "@/lib/api/types";
import { downloadApplicationPdf, downloadSummaryPdf } from "@/lib/api/usedOil";

interface Props {
  summary: UsedOilSummaryResponse;
  request: UsedOilSummaryRequest;
  onRestart: () => void;
}

export function UsedOilSummaryResult({ summary, request, onRestart }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingApplication, setDownloadingApplication] = useState(false);

  const fmtRs = (n: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadSummaryPdf(request);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadApplication() {
    setDownloadingApplication(true);
    try {
      await downloadApplicationPdf(request);
    } finally {
      setDownloadingApplication(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{summary.tier === "CA_1" ? "CA-1" : "CA-2"} — Registration summary</CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          <Metric label="Registration fee" value={fmtRs(summary.feeBreakdown.registrationFeeRs)} sub={summary.feeBreakdown.tierLabel} />
          <Metric label="Annual processing charge" value={fmtRs(summary.feeBreakdown.annualProcessingChargeRs)} />
          <Metric label="Total (first year)" value={fmtRs(summary.feeBreakdown.totalFirstYearRs)} highlight />
        </div>

        {summary.prerequisitesMet.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#3B6D11] mb-1">Prerequisites met</p>
            <ul className="list-disc list-inside text-sm text-[#444441]/80">
              {summary.prerequisitesMet.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.prerequisitesOutstanding.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#854F0B] mb-1">Prerequisites outstanding</p>
            <ul className="list-disc list-inside text-sm text-[#444441]/80">
              {summary.prerequisitesOutstanding.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-md bg-[#F1EFE8] px-4 py-3 mb-3">
          <p className="text-xs font-semibold text-[#444441] mb-1">Next step</p>
          <p className="text-sm text-[#444441]/80 leading-relaxed">{summary.nextStep}</p>
        </div>

        <div className="flex gap-2 rounded-md bg-black/5 px-4 py-3 mb-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#444441]/50" />
          <p className="text-xs text-[#444441]/60 leading-relaxed">{summary.disclaimer}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="accent"
            onClick={handleDownloadApplication}
            loading={downloadingApplication}
            className="w-full flex items-center justify-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Download prefilled {summary.tier === "CA_1" ? "CA-1" : "CA-2"} application (PDF)
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onRestart} className="flex-1">
              Start over
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              loading={downloading}
              className="flex-1 flex items-center justify-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download summary (PDF)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#F1EFE8] px-4 py-3">
      <p className="text-xs text-[#444441]/60 mb-1">{label}</p>
      <p className={highlight ? "text-lg font-bold text-[#0F6E56]" : "font-semibold text-[#444441]"}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-[#444441]/50 mt-0.5">{sub}</p>}
    </div>
  );
}
