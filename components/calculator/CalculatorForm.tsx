"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BATTERY_CATEGORY_LABELS,
  FINANCIAL_YEARS,
  type BatteryCategory,
  type ComplianceEstimateRequest,
  type ComplianceEstimateResponse,
  type FinancialYear,
} from "@/lib/api/types";
import { calculateEstimate } from "@/lib/api/calculator";
import { CalculatorResult } from "./CalculatorResult";

export function CalculatorForm() {
  const [category, setCategory] = useState<BatteryCategory>("PORTABLE");
  const [fy, setFy] = useState<FinancialYear>("2025-26");
  const [placed, setPlaced] = useState("");
  const [fulfilled, setFulfilled] = useState("");
  const [result, setResult] = useState<ComplianceEstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const request: ComplianceEstimateRequest = {
      batteryCategory: category,
      financialYear: fy,
      quantityPlacedTonnes: parseFloat(placed),
      quantityAlreadyFulfilledTonnes: fulfilled ? parseFloat(fulfilled) : undefined,
    };

    try {
      const data = await calculateEstimate(request);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estimate your EPR obligation</CardTitle>
          <p className="text-sm text-[#444441]/70 mt-1">
            Based on BWMR 2022 Schedule II recovery targets. No login required.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Battery Category */}
          <div>
            <label className="block text-sm font-medium text-[#444441] mb-1.5">
              Battery category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BatteryCategory)}
              className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
            >
              {(Object.keys(BATTERY_CATEGORY_LABELS) as BatteryCategory[]).map((k) => (
                <option key={k} value={k}>
                  {BATTERY_CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-sm font-medium text-[#444441] mb-1.5">
              Financial year
            </label>
            <select
              value={fy}
              onChange={(e) => setFy(e.target.value as FinancialYear)}
              className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
            >
              {FINANCIAL_YEARS.map((y) => (
                <option key={y} value={y}>
                  FY {y}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity placed */}
          <div>
            <label className="block text-sm font-medium text-[#444441] mb-1.5">
              Batteries placed in market this FY <span className="text-[#A32D2D]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.001"
                step="0.001"
                required
                value={placed}
                onChange={(e) => setPlaced(e.target.value)}
                placeholder="e.g. 150.000"
                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#444441]/50">
                tonnes
              </span>
            </div>
          </div>

          {/* Already fulfilled */}
          <div>
            <label className="block text-sm font-medium text-[#444441] mb-1.5">
              Already collected / certificates held{" "}
              <span className="font-normal text-[#444441]/50">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.001"
                value={fulfilled}
                onChange={(e) => setFulfilled(e.target.value)}
                placeholder="e.g. 40.000"
                className="w-full rounded-md border border-black/20 bg-white px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#444441]/50">
                tonnes
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Calculate obligation
          </Button>
        </form>
      </Card>

      {result && <CalculatorResult result={result} />}
    </div>
  );
}
