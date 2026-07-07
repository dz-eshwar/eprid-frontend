"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskPill } from "@/components/verify/RiskPill";
import { useAuth } from "@/lib/auth/AuthContext";
import { listChecks } from "@/lib/api/checks";
import type { VerificationCheckResponse } from "@/lib/api/types";

export default function ChecksListPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [checks, setChecks] = useState<VerificationCheckResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!token) return;
    listChecks(token).then(setChecks).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (!hydrated || !token) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#444441]">All checks</h1>
        <p className="mt-1 text-sm text-[#444441]/60">Every recycler verification check you've run.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checks ({checks.length})</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="h-8 flex items-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F6E56] border-t-transparent" />
          </div>
        ) : checks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#444441]/40 mb-3">No checks yet.</p>
            <Link href="/verify">
              <Button variant="primary">Run your first check</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#444441]/40 border-b border-black/5">
                <th className="pb-2 font-medium">Recycler</th>
                <th className="pb-2 font-medium">Producer</th>
                <th className="pb-2 font-medium">Waste stream</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Composite score</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/verify/${c.id}`)}
                  className="border-b border-black/5 last:border-0 hover:bg-black/[0.02] cursor-pointer"
                >
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-[#444441]">{c.recyclerName}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-[#444441]/60">{c.producerName}</td>
                  <td className="py-2.5 pr-4 text-[#444441]/50 text-xs capitalize">
                    {c.wasteStream.toLowerCase().replace("_", " ")}
                  </td>
                  <td className="py-2.5 pr-4 text-[#444441]/50 text-xs">{c.processingDate}</td>
                  <td className="py-2.5 pr-4 text-[#444441]/60 text-xs">
                    {c.compositeScore === null ? "—" : `${c.compositeScore} / 100`}
                  </td>
                  <td className="py-2.5 pr-4"><RiskPill rating={c.riskRating} /></td>
                  <td className="py-2.5 text-xs capitalize text-[#444441]/50">{c.status.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
