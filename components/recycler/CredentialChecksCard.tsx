"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMyCredentialChecks } from "@/lib/api/kyc";
import type { CredentialCheckOutcomeDto, CredentialCheckType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const CHECK_TYPE_LABELS: Record<CredentialCheckType, string> = {
  GST_VERIFICATION: "GST verification",
  GST_OTP_VERIFICATION: "GST OTP verification",
  UDYAM_VERIFICATION: "Udyam verification",
  MCA_VERIFICATION: "MCA (CIN/DIN) verification",
};

export function CredentialChecksCard() {
  const { token } = useAuth();
  const [checks, setChecks] = useState<CredentialCheckOutcomeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getMyCredentialChecks(token).then(setChecks).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account verification</CardTitle>
        <p className="text-xs text-[#444441]/60 mt-1">
          Step one of an ongoing verification relationship — not full vetting.
        </p>
      </CardHeader>

      {checks.length === 0 ? (
        <p className="text-sm text-[#444441]/40">
          No credential checks yet. Add a GSTIN or Udyam number to your profile to run one.
        </p>
      ) : (
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-[#F1EFE8] px-3 py-2">
              <div>
                <p className="text-sm font-medium text-[#444441]">{CHECK_TYPE_LABELS[c.checkType]}</p>
                {c.reason && <p className="text-xs text-[#444441]/50">{c.reason}</p>}
              </div>
              <ResultPill result={c.result} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ResultPill({ result }: { result: CredentialCheckOutcomeDto["result"] }) {
  const cls = {
    PASS: "bg-[#3B6D11]/10 text-[#3B6D11]",
    FAIL: "bg-[#A32D2D]/10 text-[#A32D2D]",
    COULD_NOT_VERIFY: "bg-[#854F0B]/10 text-[#854F0B]",
  }[result];
  const label = {
    PASS: "Pass",
    FAIL: "Fail",
    COULD_NOT_VERIFY: "Could not verify",
  }[result];
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0", cls)}>
      {label}
    </span>
  );
}
