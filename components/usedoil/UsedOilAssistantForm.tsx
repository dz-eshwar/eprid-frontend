"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StepIndicator } from "@/components/verify/StepIndicator";
import type {
  Ca1ApplicationDetails,
  Ca1PrerequisiteCheckResponse,
  Ca2ApplicationDetails,
  Ca2ReadinessChecklistResponse,
  UsedOilSummaryRequest,
  UsedOilSummaryResponse,
  UsedOilTier,
} from "@/lib/api/types";
import {
  checkCa1Prerequisite,
  determineTier,
  getCa2ReadinessChecklist,
  getSummary,
} from "@/lib/api/usedOil";
import { UsedOilSummaryResult } from "./UsedOilSummaryResult";

const STEPS = ["Tier", "Prerequisites", "Application details", "Fee & summary"];

// Form state mirrors the API shape but keeps numeric fields as strings (raw input values)
// until submit time, when `toCa1Details`/`toCa2Details` parse them.
interface Ca1DetailsForm {
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  authorizedPersonMobile: string;
  authorizedPersonEmail: string;
  vehicleRegistrationNumber: string;
  vehicleType: string;
  vehicleCapacityKl: string;
  collectionAreas: string;
  estimatedMonthlyCollectionKl: string;
}

interface Ca2DetailsForm {
  authorizedPersonName: string;
  authorizedPersonDesignation: string;
  authorizedPersonMobile: string;
  authorizedPersonEmail: string;
  storageFacilityAddress: string;
  storageCapacityKl: string;
  gstNumber: string;
  labFacilityDetails: string;
  attachedCa1sOrRecyclers: string;
}

const emptyCa1Details: Ca1DetailsForm = {
  authorizedPersonName: "",
  authorizedPersonDesignation: "",
  authorizedPersonMobile: "",
  authorizedPersonEmail: "",
  vehicleRegistrationNumber: "",
  vehicleType: "",
  vehicleCapacityKl: "",
  collectionAreas: "",
  estimatedMonthlyCollectionKl: "",
};

const emptyCa2Details: Ca2DetailsForm = {
  authorizedPersonName: "",
  authorizedPersonDesignation: "",
  authorizedPersonMobile: "",
  authorizedPersonEmail: "",
  storageFacilityAddress: "",
  storageCapacityKl: "",
  gstNumber: "",
  labFacilityDetails: "",
  attachedCa1sOrRecyclers: "",
};

function toCa1Details(f: Ca1DetailsForm): Ca1ApplicationDetails {
  return {
    ...f,
    vehicleCapacityKl: f.vehicleCapacityKl ? parseFloat(f.vehicleCapacityKl) : undefined,
    estimatedMonthlyCollectionKl: f.estimatedMonthlyCollectionKl ? parseFloat(f.estimatedMonthlyCollectionKl) : undefined,
  };
}

function toCa2Details(f: Ca2DetailsForm): Ca2ApplicationDetails {
  return {
    ...f,
    storageCapacityKl: f.storageCapacityKl ? parseFloat(f.storageCapacityKl) : undefined,
  };
}

export function UsedOilAssistantForm() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [hasStorageFacility, setHasStorageFacility] = useState(false);
  const [hasTruckFleet, setHasTruckFleet] = useState(false);
  const [tier, setTier] = useState<UsedOilTier | null>(null);
  const [tierRationale, setTierRationale] = useState("");

  const [hasAgreement, setHasAgreement] = useState<boolean | null>(null);
  const [ca1Prereq, setCa1Prereq] = useState<Ca1PrerequisiteCheckResponse | null>(null);
  const [ca2Checklist, setCa2Checklist] = useState<Ca2ReadinessChecklistResponse | null>(null);

  const [avgAnnualQuantityMt, setAvgAnnualQuantityMt] = useState("");
  const [summary, setSummary] = useState<UsedOilSummaryResponse | null>(null);
  const [summaryRequest, setSummaryRequest] = useState<UsedOilSummaryRequest | null>(null);

  const [ca1Details, setCa1Details] = useState<Ca1DetailsForm>(emptyCa1Details);
  const [ca2Details, setCa2Details] = useState<Ca2DetailsForm>(emptyCa2Details);

  async function handleTierSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await determineTier({ hasStorageFacility, hasTruckFleet });
      setTier(result.tier);
      setTierRationale(result.rationale);
      if (result.tier === "CA_2") {
        const checklist = await getCa2ReadinessChecklist();
        setCa2Checklist(checklist);
      }
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tier === "CA_1" && hasAgreement !== null) {
      setError(null);
      setLoading(true);
      checkCa1Prerequisite({ hasSignedAgreementWithCa2OrRecycler: hasAgreement })
        .then(setCa1Prereq)
        .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAgreement]);

  async function handleSummarySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tier) return;
    setError(null);
    setLoading(true);
    try {
      const req: UsedOilSummaryRequest = {
        tier,
        avgAnnualQuantityMt: parseFloat(avgAnnualQuantityMt),
        ca1PrerequisiteMet: tier === "CA_1" ? hasAgreement : null,
        ca1ApplicationDetails: tier === "CA_1" ? toCa1Details(ca1Details) : undefined,
        ca2ApplicationDetails: tier === "CA_2" ? toCa2Details(ca2Details) : undefined,
      };
      const result = await getSummary(req);
      setSummary(result);
      setSummaryRequest(req);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator steps={STEPS} current={step} />

      {error && (
        <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Which tier fits you?</CardTitle>
            <p className="text-sm text-[#444441]/70 mt-1">
              CA-1 = pickup/transport only. CA-2 = storage facility + truck fleet.
            </p>
          </CardHeader>
          <form onSubmit={handleTierSubmit} className="space-y-4">
            <Checkbox
              label="I have a storage facility"
              checked={hasStorageFacility}
              onChange={setHasStorageFacility}
            />
            <Checkbox
              label="I have a truck fleet"
              checked={hasTruckFleet}
              onChange={setHasTruckFleet}
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Determine my tier
            </Button>
          </form>
        </Card>
      )}

      {step === 1 && tier && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>You fit: {tier === "CA_1" ? "CA-1" : "CA-2"}</CardTitle>
              <p className="text-sm text-[#444441]/70 mt-1">{tierRationale}</p>
            </CardHeader>

            {tier === "CA_1" ? (
              <div className="space-y-4">
                <p className="text-sm text-[#444441]">
                  CA-1 registration requires a signed agreement with a CA-2 or recycler{" "}
                  <strong>already in place</strong> before applying.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant={hasAgreement === true ? "primary" : "outline"}
                    onClick={() => setHasAgreement(true)}
                    className="flex-1"
                  >
                    I have a signed agreement
                  </Button>
                  <Button
                    variant={hasAgreement === false ? "primary" : "outline"}
                    onClick={() => setHasAgreement(false)}
                    className="flex-1"
                  >
                    Not yet
                  </Button>
                </div>
                {ca1Prereq && (
                  <div
                    className={
                      ca1Prereq.canProceed
                        ? "rounded-md bg-[#3B6D11]/5 border border-[#3B6D11]/20 px-4 py-3"
                        : "rounded-md bg-[#854F0B]/5 border border-[#854F0B]/20 px-4 py-3"
                    }
                  >
                    <p className="text-sm text-[#444441]">{ca1Prereq.message}</p>
                    <p className="mt-2 text-xs font-semibold text-[#444441]/70">
                      A valid agreement must contain:
                    </p>
                    <ul className="mt-1 list-disc list-inside text-xs text-[#444441]/70 space-y-0.5">
                      {ca1Prereq.requiredAgreementContents.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              ca2Checklist && (
                <div className="space-y-2">
                  <p className="text-sm text-[#444441]/70 mb-2">
                    CA-2 readiness checklist — these are things you need in place, not something
                    this tool can provide:
                  </p>
                  {ca2Checklist.items.map((item) => (
                    <div key={item.label} className="rounded-md bg-[#F1EFE8] px-3 py-2">
                      <p className="text-sm font-medium text-[#444441]">{item.label}</p>
                      <p className="text-xs text-[#444441]/60">{item.description}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
              ← Back
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="flex-1"
              disabled={tier === "CA_1" && hasAgreement === null}
            >
              Continue to application details →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && tier && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application details</CardTitle>
              <p className="text-sm text-[#444441]/70 mt-1">
                Fill in what you know now — these autofill your downloadable {tier === "CA_1" ? "CA-1" : "CA-2"}{" "}
                application worksheet. Everything here is optional; blanks are marked for you to fill on the
                CPCB portal.
              </p>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#444441]/70 mb-2">Authorized person</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField label="Name" value={person(tier, ca1Details, ca2Details).authorizedPersonName}
                    onChange={(v) => setPerson(tier, setCa1Details, setCa2Details, "authorizedPersonName", v)} />
                  <TextField label="Designation" value={person(tier, ca1Details, ca2Details).authorizedPersonDesignation}
                    onChange={(v) => setPerson(tier, setCa1Details, setCa2Details, "authorizedPersonDesignation", v)} />
                  <TextField label="Mobile" value={person(tier, ca1Details, ca2Details).authorizedPersonMobile}
                    onChange={(v) => setPerson(tier, setCa1Details, setCa2Details, "authorizedPersonMobile", v)} />
                  <TextField label="Email" value={person(tier, ca1Details, ca2Details).authorizedPersonEmail}
                    onChange={(v) => setPerson(tier, setCa1Details, setCa2Details, "authorizedPersonEmail", v)} />
                </div>
              </div>

              {tier === "CA_1" ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-[#444441]/70 mb-2">Vehicle details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Registration number" value={ca1Details.vehicleRegistrationNumber}
                        onChange={(v) => setCa1Details((d) => ({ ...d, vehicleRegistrationNumber: v }))} />
                      <TextField label="Vehicle type" value={ca1Details.vehicleType}
                        onChange={(v) => setCa1Details((d) => ({ ...d, vehicleType: v }))} />
                      <TextField label="Capacity (KL)" type="number" value={ca1Details.vehicleCapacityKl}
                        onChange={(v) => setCa1Details((d) => ({ ...d, vehicleCapacityKl: v }))} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#444441]/70 mb-2">Oil collection details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Collection areas / routes" value={ca1Details.collectionAreas}
                        onChange={(v) => setCa1Details((d) => ({ ...d, collectionAreas: v }))} />
                      <TextField label="Estimated monthly collection (KL)" type="number" value={ca1Details.estimatedMonthlyCollectionKl}
                        onChange={(v) => setCa1Details((d) => ({ ...d, estimatedMonthlyCollectionKl: v }))} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-[#444441]/70 mb-2">Storage facility</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="Facility address" value={ca2Details.storageFacilityAddress}
                        onChange={(v) => setCa2Details((d) => ({ ...d, storageFacilityAddress: v }))} />
                      <TextField label="Storage capacity (KL)" type="number" value={ca2Details.storageCapacityKl}
                        onChange={(v) => setCa2Details((d) => ({ ...d, storageCapacityKl: v }))} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#444441]/70 mb-2">General &amp; lab</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField label="GST number" value={ca2Details.gstNumber}
                        onChange={(v) => setCa2Details((d) => ({ ...d, gstNumber: v }))} />
                      <TextField label="Lab facility" value={ca2Details.labFacilityDetails}
                        onChange={(v) => setCa2Details((d) => ({ ...d, labFacilityDetails: v }))} />
                      <TextField label="Attached CA-1s / recyclers" value={ca2Details.attachedCa1sOrRecyclers}
                        onChange={(v) => setCa2Details((d) => ({ ...d, attachedCa1sOrRecyclers: v }))} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Back
            </Button>
            <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
              Continue to fee estimate →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && tier && !summary && (
        <Card>
          <CardHeader>
            <CardTitle>Fee estimate</CardTitle>
            <p className="text-sm text-[#444441]/70 mt-1">
              Fee tier is based on average annual quantity collected (MT) across the last two FYs.
            </p>
          </CardHeader>
          <form onSubmit={handleSummarySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444441] mb-1.5">
                Average annual quantity collected (MT) *
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                required
                value={avgAnnualQuantityMt}
                onChange={(e) => setAvgAnnualQuantityMt(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                ← Back
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="flex-1">
                Build my summary
              </Button>
            </div>
          </form>
        </Card>
      )}

      {summary && summaryRequest && (
        <UsedOilSummaryResult
          summary={summary}
          request={summaryRequest}
          onRestart={() => {
            setStep(0);
            setTier(null);
            setHasAgreement(null);
            setCa1Prereq(null);
            setCa2Checklist(null);
            setSummary(null);
            setSummaryRequest(null);
            setAvgAnnualQuantityMt("");
            setCa1Details(emptyCa1Details);
            setCa2Details(emptyCa2Details);
          }}
        />
      )}
    </div>
  );
}

// The two application-detail forms share 4 "authorized person" fields; these helpers read/write
// whichever of the two form states is active for the current tier so the JSX above doesn't branch.
function person(tier: UsedOilTier, ca1: Ca1DetailsForm, ca2: Ca2DetailsForm) {
  return tier === "CA_1" ? ca1 : ca2;
}

function setPerson(
  tier: UsedOilTier,
  setCa1: React.Dispatch<React.SetStateAction<Ca1DetailsForm>>,
  setCa2: React.Dispatch<React.SetStateAction<Ca2DetailsForm>>,
  field: "authorizedPersonName" | "authorizedPersonDesignation" | "authorizedPersonMobile" | "authorizedPersonEmail",
  value: string
) {
  if (tier === "CA_1") setCa1((d) => ({ ...d, [field]: value }));
  else setCa2((d) => ({ ...d, [field]: value }));
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number";
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#444441]/70 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#444441] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-black/20 accent-[#0F6E56]"
      />
      {label}
    </label>
  );
}
