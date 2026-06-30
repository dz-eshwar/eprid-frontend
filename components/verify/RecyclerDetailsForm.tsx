"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlausibilityResults } from "./PlausibilityResults";
import type { CreateCheckRequest, VerificationCheckResponse } from "@/lib/api/types";
import { createCheck } from "@/lib/api/checks";

interface Props {
  token: string;
  estimateId?: string;
  onCreated: (check: VerificationCheckResponse) => void;
}

export function RecyclerDetailsForm({ token, estimateId, onCreated }: Props) {
  const [form, setForm] = useState({
    recyclerName: "",
    bwmrRegNumber: "",
    recyclerState: "",
    recyclerSelfReportedCapacityT: "",
    producerName: "",
    cpcbRegNumber: "",
    batchWeightTonnes: "",
    claimedRecoveryPct: "",
    processingDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  // After submission, hold the check and show plausibility before advancing
  const [pending, setPending] = useState<VerificationCheckResponse | null>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const req: CreateCheckRequest = {
        recyclerName: form.recyclerName,
        bwmrRegNumber: form.bwmrRegNumber || undefined,
        recyclerState: form.recyclerState || undefined,
        recyclerSelfReportedCapacityT: form.recyclerSelfReportedCapacityT
          ? parseFloat(form.recyclerSelfReportedCapacityT)
          : undefined,
        producerName: form.producerName,
        cpcbRegNumber: form.cpcbRegNumber || undefined,
        batchWeightTonnes: parseFloat(form.batchWeightTonnes),
        claimedRecoveryPct: parseFloat(form.claimedRecoveryPct),
        processingDate: form.processingDate,
        complianceEstimateId: estimateId || undefined,
      };
      const check = await createCheck(req, token);
      setPending(check);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create check");
    } finally {
      setLoading(false);
    }
  }

  // ── Show plausibility gate before advancing ──────────────────────────────────
  if (pending) {
    const plaus = pending.plausibility;
    const isFail = plaus?.overallStatus === "FAIL";

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Batch details saved</CardTitle>
            <p className="text-sm text-[#444441]/60 mt-1">
              We ran an immediate plausibility check on the batch figures you entered.
              Review the results below before uploading evidence.
            </p>
          </CardHeader>
        </Card>

        {plaus && <PlausibilityResults result={plaus} defaultExpanded />}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPending(null)} className="flex-1">
            ← Edit details
          </Button>
          <Button
            variant="primary"
            onClick={() => onCreated(pending)}
            className="flex-1"
            // FAIL is a warning, not a hard block — user may still upload evidence
            // but we make the risk visible
          >
            {isFail ? "Continue anyway →" : "Continue to evidence upload →"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recycler &amp; batch details</CardTitle>
        <p className="text-sm text-[#444441]/60 mt-1">
          Enter the recycler&apos;s details and the batch they&apos;re claiming.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            Recycler
          </legend>
          <Row>
            <Field
              label="Recycler name *"
              value={form.recyclerName} onChange={set("recyclerName")}
              required placeholder="e.g. ABC Recyclers Pvt Ltd"
            />
            <Field
              label="BWMR registration number"
              value={form.bwmrRegNumber} onChange={set("bwmrRegNumber")}
              placeholder="e.g. BWMR/2023/001"
            />
          </Row>
          <Row>
            <div>
              <label className="block text-sm font-medium text-[#444441] mb-1.5">
                Registered state
              </label>
              <select
                value={form.recyclerState}
                onChange={set("recyclerState")}
                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              >
                <option value="">— Select state —</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Field
              label="Self-reported annual capacity (tonnes)"
              type="number" min="0" step="0.001"
              value={form.recyclerSelfReportedCapacityT}
              onChange={set("recyclerSelfReportedCapacityT")}
              placeholder="e.g. 1200"
            />
          </Row>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            Producer (your client)
          </legend>
          <Row>
            <Field
              label="Producer name *"
              value={form.producerName} onChange={set("producerName")}
              required placeholder="e.g. XYZ Battery Co"
            />
            <Field
              label="CPCB registration number"
              value={form.cpcbRegNumber} onChange={set("cpcbRegNumber")}
              placeholder="e.g. CPCB/2023/001"
            />
          </Row>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            Batch being claimed
          </legend>
          <Row>
            <Field
              label="Weight processed (tonnes) *"
              type="number" min="0.001" step="0.001"
              value={form.batchWeightTonnes} onChange={set("batchWeightTonnes")}
              required placeholder="e.g. 50.000"
            />
            <Field
              label="Claimed recovery % *"
              type="number" min="0" max="100" step="0.01"
              value={form.claimedRecoveryPct} onChange={set("claimedRecoveryPct")}
              required placeholder="e.g. 75"
            />
          </Row>
          <Field
            label="Processing date *"
            type="date"
            value={form.processingDate} onChange={set("processingDate")}
            required
          />
        </fieldset>

        {error && (
          <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Check batch plausibility →
        </Button>
      </form>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label, ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#444441] mb-1.5">{label}</label>
      <input
        {...props}
        type={props.type ?? "text"}
        className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
    </div>
  );
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
