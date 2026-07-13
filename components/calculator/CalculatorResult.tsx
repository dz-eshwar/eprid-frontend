"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Info, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BATTERY_CATEGORY_LABELS,
  type ComplianceEstimateResponse,
  type EcExposureBreakdown,
  type RecycledContentObligation,
} from "@/lib/api/types";
import { formatNumber, cn } from "@/lib/utils";

interface Props {
  result: ComplianceEstimateResponse;
}

export function CalculatorResult({ result }: Props) {
  const router = useRouter();

  if (!result.applicable) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {BATTERY_CATEGORY_LABELS[result.batteryCategory]} — FY {result.financialYear}
            </CardTitle>
          </CardHeader>
          <div className="flex gap-2 rounded-md bg-black/5 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#444441]/50" />
            <p className="text-sm text-[#444441]/80 leading-relaxed">
              {result.notApplicableReason ??
                "Schedule II's collection-target cycle for this category has not started for this financial year — there is no mandatory collection target yet."}
            </p>
          </div>
        </Card>

        {result.recycledContentObligation && (
          <RecycledContentSection obligation={result.recycledContentObligation} />
        )}

        <div className="flex gap-2 rounded-md bg-black/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#444441]/50" />
          <p className="text-xs text-[#444441]/60 leading-relaxed">{result.disclaimer}</p>
        </div>
      </div>
    );
  }

  // Below this point, applicable is true — the backend contract guarantees the target/shortfall
  // fields are populated (see ComplianceCalculatorService.calculate()).
  const targetTonnes = result.targetTonnes!;
  const shortfallTonnes = result.shortfallTonnes!;
  const shortfallKg = result.shortfallKg!;
  const hasShortfall = shortfallTonnes > 0;

  function handleVerify() {
    // Pass estimateId so Module A pre-populates the certificate volume needed
    router.push(`/verify?estimateId=${result.estimateId}&volume=${shortfallKg}`);
  }

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <Card>
        <CardHeader>
          <CardTitle>
            {BATTERY_CATEGORY_LABELS[result.batteryCategory]} — FY {result.financialYear}
          </CardTitle>
          {result.referenceFinancialYear && (
            <p className="text-xs text-[#444441]/50 mt-1">
              Target applies to quantity placed in FY {result.referenceFinancialYear} — used here as a
              same-year proxy for the FY you entered.
            </p>
          )}
        </CardHeader>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Recovery target" value={`${result.recoveryTargetPercent}%`} />
          <Metric
            label="Target (tonnes)"
            value={formatNumber(targetTonnes)}
          />
          <Metric
            label="Shortfall (tonnes)"
            value={formatNumber(shortfallTonnes)}
            highlight={hasShortfall}
          />
          <Metric
            label="Certificates needed (kg)"
            value={formatNumber(shortfallKg)}
            highlight={hasShortfall}
            large
          />
        </div>
      </Card>

      {/* Other Schedule II obligations — informational, not folded into the shortfall above */}
      {(result.recyclingRefurbishmentObligation || result.carryForwardCapPercent != null) && (
        <div className="flex gap-2 rounded-md bg-black/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#444441]/50" />
          <div className="text-xs text-[#444441]/70 leading-relaxed space-y-1">
            {result.recyclingRefurbishmentObligation && (
              <p>{result.recyclingRefurbishmentObligation.note}</p>
            )}
            {result.carryForwardBasisNote && <p>{result.carryForwardBasisNote}</p>}
          </div>
        </div>
      )}

      {result.recycledContentObligation && (
        <RecycledContentSection obligation={result.recycledContentObligation} />
      )}

      {/* Call to action — only one accent element per screen per design rules */}
      {hasShortfall && (
        <Card className="border-[#D85A30]/20 bg-[#D85A30]/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D85A30]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#444441]">
                {result.callToAction.message}
              </p>
              <p className="mt-1 text-sm text-[#444441]/70">
                You need{" "}
                <strong>{formatNumber(shortfallKg)} kg</strong> of certificates.
                Verify the recycler before committing to this volume.
              </p>
            </div>
            <Button
              variant="accent"
              onClick={handleVerify}
              className="shrink-0 flex items-center gap-1.5"
            >
              Verify a recycler
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* EC Exposure */}
      {result.ecExposure && <EcExposureSection ec={result.ecExposure} />}

      {/* Disclaimer */}
      <div className="flex gap-2 rounded-md bg-black/5 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#444441]/50" />
        <p className="text-xs text-[#444441]/60 leading-relaxed">{result.disclaimer}</p>
      </div>
    </div>
  );
}

function EcExposureSection({ ec }: { ec: EcExposureBreakdown }) {
  const fmtRs = (n: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  const tiers = [
    { label: "EC deposited", sub: "Initial liability", value: fmtRs(ec.ecDepositedRs), muted: true },
    { label: "Net — resolve Year 1", sub: "75% refund", value: fmtRs(ec.netIfResolvedYear1Rs), good: true },
    { label: "Net — resolve Year 2", sub: "60% refund", value: fmtRs(ec.netIfResolvedYear2Rs) },
    { label: "Net — resolve Year 3", sub: "40% refund", value: fmtRs(ec.netIfResolvedYear3Rs) },
    { label: "Full forfeiture (>Year 3)", sub: "No refund", value: fmtRs(ec.netIfForfeitedRs), bad: true },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[#A32D2D]" />
          <CardTitle>Environmental Compensation exposure</CardTitle>
        </div>
        <p className="text-xs text-[#444441]/60 mt-1">
          Resolving the shortfall earlier reduces net cost via carry-forward refund.
          Rate: {new Intl.NumberFormat("en-IN").format(ec.ecRatePerTonneRs)} ₹/tonne.
        </p>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiers.map((t) => (
          <div
            key={t.label}
            className={cn(
              "rounded-lg px-3 py-3",
              t.good ? "bg-[#3B6D11]/5 border border-[#3B6D11]/20"
                : t.bad ? "bg-[#A32D2D]/5 border border-[#A32D2D]/20"
                : "bg-[#F1EFE8]"
            )}
          >
            <p className="text-[10px] text-[#444441]/50 leading-tight">{t.label}</p>
            <p className="text-[10px] text-[#444441]/40 mb-1">{t.sub}</p>
            <p className={cn(
              "text-sm font-bold",
              t.good ? "text-[#3B6D11]" : t.bad ? "text-[#A32D2D]" : "text-[#444441]"
            )}>{t.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#444441]/40 leading-relaxed">{ec.caveat}</p>
    </Card>
  );
}

// Rule 4(14) minimum recycled-material-content — informational only, separate obligation from
// the collection-target shortfall above (different quantity base: manufactured, not collected).
function RecycledContentSection({ obligation }: { obligation: RecycledContentObligation }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Minimum recycled-content requirement</CardTitle>
        <p className="text-xs text-[#444441]/60 mt-1">
          {obligation.applicableNow
            ? `In effect from FY ${obligation.startsFinancialYear}.`
            : `Not yet in effect — starts FY ${obligation.startsFinancialYear}.`}
        </p>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {obligation.ramp.map((r) => (
          <div key={r.financialYear} className="rounded-lg bg-[#F1EFE8] px-3 py-3">
            <p className="text-[10px] text-[#444441]/50 leading-tight">FY {r.financialYear}</p>
            <p className="text-sm font-bold text-[#444441]">{r.minimumPercent}%</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#444441]/40 leading-relaxed">{obligation.note}</p>
    </Card>
  );
}

function Metric({
  label,
  value,
  highlight,
  large,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#F1EFE8] px-4 py-3">
      <p className="text-xs text-[#444441]/60 mb-1">{label}</p>
      <p
        className={[
          "font-semibold",
          large ? "text-xl" : "text-base",
          highlight ? "text-[#854F0B]" : "text-[#444441]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
