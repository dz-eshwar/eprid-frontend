"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  confirmCpcbReview,
  listCpcbPendingReview,
  listCpcbRefreshRuns,
  triggerCpcbRefresh,
} from "@/lib/api/cpcbRecyclers";
import { RiskPill } from "@/components/verify/RiskPill";
import type { CpcbPendingReviewItemDto, CpcbRefreshRunSummaryDto } from "@/lib/api/types";

const FIELD_LABELS: Record<string, string> = {
  recycler_consent_air: "Air consent expiry",
  recycler_consent_water: "Water consent expiry",
  recycler_hwmd_valid: "HWM authorization expiry",
  recycler_dic_valid: "DIC validity expiry",
  recycling_capacity: "Recycling capacity",
  recycler_type: "Authorization category",
  InspectionStatus: "Inspection status",
  InternalAppStatus: "Internal application status",
  certificate: "Certificate flag",
};

const STATUS_STYLE: Record<CpcbRefreshRunSummaryDto["status"], string> = {
  SUCCESS: "text-[#3B6D11] bg-[#3B6D11]/10",
  PARTIAL: "text-[#854F0B] bg-[#854F0B]/10",
  FAILED: "text-[#A32D2D] bg-[#A32D2D]/10",
  RUNNING: "text-[#444441]/60 bg-black/5",
};

export default function CpcbReviewPage() {
  const { token, user } = useAuth();
  const [pending, setPending] = useState<CpcbPendingReviewItemDto[] | null>(null);
  const [runs, setRuns] = useState<CpcbRefreshRunSummaryDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        listCpcbPendingReview(token),
        listCpcbRefreshRuns(token),
      ]);
      setPending(p);
      setRuns(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex rounded-full bg-[#0F6E56]/10 p-4 mb-6">
          <ShieldCheck className="h-10 w-10 text-[#0F6E56]" />
        </div>
        <h1 className="text-2xl font-bold text-[#444441] mb-3">Sign in required</h1>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="primary">Log in</Button></Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex rounded-full bg-[#A32D2D]/10 p-4 mb-6">
          <AlertTriangle className="h-10 w-10 text-[#A32D2D]" />
        </div>
        <h1 className="text-2xl font-bold text-[#444441] mb-3">Admins only</h1>
        <p className="text-[#444441]/70">This screen isn&apos;t available for your account role.</p>
      </div>
    );
  }

  async function handleRefreshNow() {
    if (!token) return;
    setRefreshing(true);
    setError(null);
    try {
      await triggerCpcbRefresh(token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh run failed");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleConfirm(id: string) {
    if (!token) return;
    setConfirmingId(id);
    try {
      await confirmCpcbReview(id, token);
      setPending((prev) => prev?.filter((item) => item.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm this recycler");
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#444441]">CPCB Directory Review</h1>
          <p className="mt-1 text-sm text-[#444441]/60">
            Recyclers whose risk band changed on the last refresh — held back from the public
            directory until confirmed here.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshNow} loading={refreshing}>
          <RefreshCw className="h-4 w-4 mr-2" /> Run refresh now
        </Button>
      </div>

      {error && (
        <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-8 flex items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F6E56] border-t-transparent" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pending review ({pending?.length ?? 0})</CardTitle>
            </CardHeader>
            {!pending || pending.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-[#3B6D11] py-4">
                <CheckCircle2 className="h-4 w-4" /> Nothing waiting on review.
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((item) => (
                  <div key={item.id} className="border border-black/5 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-[#444441]">{item.recyclerName}</p>
                        {item.cpcbId && (
                          <p className="text-xs text-[#444441]/40">CPCB #{item.cpcbId}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {item.latestScore && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-[#444441]/70">
                            New band <RiskPill rating={item.latestScore.riskBand} />
                          </span>
                        )}
                        <Button
                          variant="primary"
                          className="text-xs py-1.5 px-3"
                          loading={confirmingId === item.id}
                          onClick={() => handleConfirm(item.id)}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>

                    {item.recentDiffs.length > 0 && (
                      <table className="w-full text-xs mt-3">
                        <thead>
                          <tr className="text-left text-[#444441]/40 border-b border-black/5">
                            <th className="pb-1 font-medium">Field</th>
                            <th className="pb-1 font-medium">Old</th>
                            <th className="pb-1 font-medium">New</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.recentDiffs.map((d, i) => (
                            <tr key={i} className="border-b border-black/5 last:border-0">
                              <td className="py-1.5 pr-3 text-[#444441]/70">
                                {FIELD_LABELS[d.fieldName] ?? d.fieldName}
                              </td>
                              <td className="py-1.5 pr-3 text-[#444441]/50">{d.oldValue ?? "—"}</td>
                              <td className="py-1.5 text-[#444441] font-medium">{d.newValue ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent refresh runs</CardTitle>
            </CardHeader>
            {!runs || runs.length === 0 ? (
              <p className="text-sm text-[#444441]/50 py-4">No refresh runs yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#444441]/40 border-b border-black/5">
                    <th className="pb-2 font-medium">Started</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Fetched</th>
                    <th className="pb-2 font-medium">Changed</th>
                    <th className="pb-2 font-medium">New</th>
                    <th className="pb-2 font-medium">Missing</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-b border-black/5 last:border-0">
                      <td className="py-2 pr-3 text-[#444441]/70">
                        {new Date(r.startedAt).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[#444441]/70">{r.recordsFetched}</td>
                      <td className="py-2 pr-3 text-[#444441]/70">{r.recordsChanged}</td>
                      <td className="py-2 pr-3 text-[#444441]/70">{r.recordsNew}</td>
                      <td className="py-2 text-[#444441]/70">{r.recordsMissing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
