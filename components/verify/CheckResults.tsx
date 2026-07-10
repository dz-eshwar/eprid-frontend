"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadReport } from "@/lib/api/checks";
import { CompositeScoreCard } from "./CompositeScoreCard";
import { PlausibilityResults } from "./PlausibilityResults";
import { CompositionCheckResults } from "./CompositionCheckResults";
import { ForensicsResults } from "./ForensicsResults";
import { EvidenceSummaryList } from "./EvidenceSummaryList";
import { RegulatoryHistory } from "./RegulatoryHistory";
import type { EvidenceSummaryDto, EvidenceUploadResponse, VerificationCheckResponse } from "@/lib/api/types";

interface Props {
  check: VerificationCheckResponse;
  token: string;
  /** Live upload results — only present right after finishing the wizard's evidence step. */
  forensicsResult?: EvidenceUploadResponse | null;
  /** Read-later evidence summaries — used when reopening a check outside the wizard. */
  evidenceSummaries?: EvidenceSummaryDto[] | null;
  onRunAnother?: () => void;
}

/**
 * The full results view for a completed (or in-progress) check: composite score, plausibility,
 * document forensics, regulatory history, and the report-download button. Shared between the
 * wizard's final step (VerifyFlow) and the standalone /verify/[checkId] page so a check's
 * results look identical whether you just finished the wizard or came back to it later.
 */
export function CheckResults({ check, token, forensicsResult, evidenceSummaries, onRunAnother }: Props) {
  const t = useTranslations("verify");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownloadReport() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadReport(check.id, token);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#444441]">{t("results.heading")}</h2>
          <p className="text-sm text-[#444441]/60 mt-0.5">
            {check.recyclerName} · {check.batchWeightTonnes} T · {check.processingDate}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 flex items-center gap-1.5 text-xs"
          onClick={handleDownloadReport}
          disabled={downloading}
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? t("results.downloading") : t("results.downloadPdf")}
        </Button>
      </div>
      {downloadError && <p className="text-xs text-[#A32D2D]">{downloadError}</p>}

      <section>
        <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
          {t("results.compositeScore")}
        </h3>
        <CompositeScoreCard
          compositeScore={check.compositeScore}
          breakdown={check.compositeScoreBreakdown}
          hardDisqualified={check.hardDisqualified}
          hardDisqualificationReason={check.hardDisqualificationReason}
          riskRating={check.riskRating}
          riskSummary={check.riskSummary}
        />
      </section>

      {check.plausibility && (
        <section>
          <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
            {t("results.batchPlausibility")}
          </h3>
          <PlausibilityResults result={check.plausibility} />
        </section>
      )}

      {check.compositionChecks.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
            {t("results.compositionCheck")}
          </h3>
          <CompositionCheckResults checks={check.compositionChecks} />
        </section>
      )}

      <section>
        <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
          {t("results.documentForensics")}
        </h3>
        {forensicsResult ? (
          <ForensicsResults result={forensicsResult} onRunAnother={onRunAnother ?? (() => {})} />
        ) : (
          <EvidenceSummaryList evidence={evidenceSummaries ?? []} />
        )}
      </section>

      <section>
        <h3 className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-3">
          {t("results.regulatoryHistory")}
        </h3>
        <RegulatoryHistory
          checkId={check.id}
          token={token}
          initialStatus={check.regulatoryStatus}
        />
      </section>
    </div>
  );
}
