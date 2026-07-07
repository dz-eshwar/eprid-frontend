"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlausibilityResults } from "./PlausibilityResults";
import { useAuth } from "@/lib/auth/AuthContext";
import type { CreateCheckRequest, TyreEndProduct, VerificationCheckResponse } from "@/lib/api/types";
import { TYRE_END_PRODUCT_LABELS } from "@/lib/api/types";
import { createCheck } from "@/lib/api/checks";

interface Props {
  token: string;
  estimateId?: string;
  onCreated: (check: VerificationCheckResponse) => void;
}

export function RecyclerDetailsForm({ token, estimateId, onCreated }: Props) {
  const t = useTranslations("recyclerDetailsForm");
  const { user } = useAuth();
  // PUBLISHER = self-service producer checking a recycler on their own behalf — the
  // producer *is* the logged-in user, so don't ask them to re-enter their own details.
  // CONSULTANT (and other roles) work across multiple producer clients and must name one.
  const showProducerFields = user?.role !== "PUBLISHER";
  const [form, setForm] = useState({
    wasteStream: "BATTERY",
    recyclerName: "",
    bwmrRegNumber: "",
    recyclerState: "",
    recyclerSelfReportedCapacityT: "",
    producerName: "",
    cpcbRegNumber: "",
    batchWeightTonnes: "",
    claimedRecoveryPct: "",
    claimedOutputQuantity: "",
    tyreEndProduct: "" as TyreEndProduct | "",
    tyreImported: false,
    claimedEprCreditKg: "",
    processingDate: "",
  });
  const isTyre = form.wasteStream === "TYRE";
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
        producerName: showProducerFields ? form.producerName : (user?.fullName ?? ""),
        cpcbRegNumber: showProducerFields ? (form.cpcbRegNumber || undefined) : undefined,
        wasteStream: form.wasteStream as "BATTERY" | "TYRE",
        batchWeightTonnes: parseFloat(form.batchWeightTonnes),
        // Tyre checks use claimedOutputQuantity/tyreEndProduct/claimedEprCreditKg instead — the
        // DTO still requires claimedRecoveryPct, so send 0 rather than adding a conditional
        // backend validation.
        claimedRecoveryPct: isTyre ? 0 : parseFloat(form.claimedRecoveryPct),
        claimedOutputQuantity: isTyre ? parseFloat(form.claimedOutputQuantity) : undefined,
        tyreEndProduct: isTyre ? (form.tyreEndProduct as TyreEndProduct) : undefined,
        tyreImported: isTyre ? form.tyreImported : undefined,
        claimedEprCreditKg: isTyre ? parseFloat(form.claimedEprCreditKg) : undefined,
        processingDate: form.processingDate,
        complianceEstimateId: estimateId || undefined,
      };
      const check = await createCheck(req, token);
      setPending(check);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createFailed"));
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
            <CardTitle>{t("batchSaved")}</CardTitle>
            <p className="text-sm text-[#444441]/60 mt-1">
              {t("plausibilityIntro")}
            </p>
          </CardHeader>
        </Card>

        {plaus && <PlausibilityResults result={plaus} defaultExpanded />}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPending(null)} className="flex-1">
            {t("editDetails")}
          </Button>
          <Button
            variant="primary"
            onClick={() => onCreated(pending)}
            className="flex-1"
            // FAIL is a warning, not a hard block — user may still upload evidence
            // but we make the risk visible
          >
            {isFail ? t("continueAnyway") : t("continueToEvidence")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
        <p className="text-sm text-[#444441]/60 mt-1">
          {t("cardSubtitle")}
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            {t("sectionWasteStream")}
          </legend>
          <div>
            <label className="block text-sm font-medium text-[#444441] mb-1.5">
              {t("fields.wasteStream")}
            </label>
            <select
              value={form.wasteStream}
              onChange={(e) => setForm((f) => ({ ...f, wasteStream: e.target.value }))}
              className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
            >
              <option value="BATTERY">{t("fields.wasteStreamBattery")}</option>
              <option value="TYRE">{t("fields.wasteStreamTyre")}</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            {t("sectionRecycler")}
          </legend>
          <Row>
            <Field
              label={t("fields.recyclerName")}
              value={form.recyclerName} onChange={set("recyclerName")}
              required placeholder={t("fields.recyclerNamePlaceholder")}
            />
            <Field
              label={isTyre ? t("fields.tyreRegNumber") : t("fields.bwmrRegNumber")}
              value={form.bwmrRegNumber} onChange={set("bwmrRegNumber")}
              placeholder={t("fields.bwmrRegNumberPlaceholder")}
            />
          </Row>
          <Row>
            <div>
              <label className="block text-sm font-medium text-[#444441] mb-1.5">
                {t("fields.registeredState")}
              </label>
              <select
                value={form.recyclerState}
                onChange={set("recyclerState")}
                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              >
                <option value="">{t("fields.selectState")}</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Field
              label={t("fields.selfReportedCapacity")}
              type="number" min="0" step="0.001"
              value={form.recyclerSelfReportedCapacityT}
              onChange={set("recyclerSelfReportedCapacityT")}
              placeholder={t("fields.selfReportedCapacityPlaceholder")}
            />
          </Row>
        </fieldset>

        {showProducerFields && (
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
              {t("sectionProducer")}
            </legend>
            <Row>
              <Field
                label={t("fields.producerName")}
                value={form.producerName} onChange={set("producerName")}
                required placeholder={t("fields.producerNamePlaceholder")}
              />
              <Field
                label={t("fields.cpcbRegNumber")}
                value={form.cpcbRegNumber} onChange={set("cpcbRegNumber")}
                placeholder={t("fields.cpcbRegNumberPlaceholder")}
              />
            </Row>
          </fieldset>
        )}

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-[#444441]/50 uppercase tracking-wide mb-2">
            {t("sectionBatch")}
          </legend>
          <Row>
            <Field
              label={t("fields.weightProcessed")}
              type="number" min="0.001" step="0.001"
              value={form.batchWeightTonnes} onChange={set("batchWeightTonnes")}
              required placeholder={t("fields.weightProcessedPlaceholder")}
            />
            {isTyre ? (
              <Field
                label={t("fields.claimedOutputQuantity")}
                type="number" min="0" step="0.001"
                value={form.claimedOutputQuantity} onChange={set("claimedOutputQuantity")}
                required placeholder={t("fields.claimedOutputQuantityPlaceholder")}
              />
            ) : (
              <Field
                label={t("fields.claimedRecoveryPct")}
                type="number" min="0" max="100" step="0.01"
                value={form.claimedRecoveryPct} onChange={set("claimedRecoveryPct")}
                required placeholder={t("fields.claimedRecoveryPctPlaceholder")}
              />
            )}
          </Row>

          {isTyre && (
            <>
              <Row>
                <div>
                  <label className="block text-sm font-medium text-[#444441] mb-1.5">
                    {t("fields.tyreEndProduct")}
                  </label>
                  <select
                    value={form.tyreEndProduct}
                    onChange={set("tyreEndProduct")}
                    required
                    className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                  >
                    <option value="">{t("fields.selectEndProduct")}</option>
                    {Object.entries(TYRE_END_PRODUCT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <Field
                  label={t("fields.claimedEprCreditKg")}
                  type="number" min="0" step="0.001"
                  value={form.claimedEprCreditKg} onChange={set("claimedEprCreditKg")}
                  required placeholder={t("fields.claimedEprCreditKgPlaceholder")}
                />
              </Row>
              <label className="flex items-center gap-2 text-sm text-[#444441]">
                <input
                  type="checkbox"
                  checked={form.tyreImported}
                  onChange={(e) => setForm((f) => ({ ...f, tyreImported: e.target.checked }))}
                  className="rounded border-black/20 focus:ring-2 focus:ring-[#0F6E56]"
                />
                {t("fields.tyreImported")}
              </label>
            </>
          )}

          <Field
            label={t("fields.processingDate")}
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
          {t("submit")}
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
