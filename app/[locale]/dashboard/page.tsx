"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Calculator, ShieldCheck, FolderOpen, FileText, Recycle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";
import { listChecks } from "@/lib/api/checks";
import { listMyDocs } from "@/lib/api/vault";
import type { VerificationCheckResponse, VaultDocument } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CredentialChecksCard } from "@/components/recycler/CredentialChecksCard";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;

  const isRecycler = user?.role === "RECYCLER";
  return isRecycler ? <RecyclerDashboard /> : <PublisherDashboard />;
}

// ─── Publisher dashboard ──────────────────────────────────────────────────────

function PublisherDashboard() {
  const { user, token } = useAuth();
  const [checks, setChecks] = useState<VerificationCheckResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    listChecks(token).then(setChecks).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const recent = checks.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#444441]">
          Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-[#444441]/60">BWMR 2022 battery EPR compliance dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon={<Calculator className="h-5 w-5 text-[#0F6E56]" />}
          title="EPR Calculator"
          desc="Estimate your obligation and certificate shortfall for the current FY."
          href="/calculator"
          cta="Open calculator"
        />
        <QuickAction
          icon={<ShieldCheck className="h-5 w-5 text-[#0F6E56]" />}
          title="Verify a Recycler"
          desc="Evidence-backed risk check before buying certificates from a recycler."
          href="/verify"
          cta="New check"
          accent
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent checks</CardTitle>
            <Link href="/verify" className="text-xs text-[#0F6E56] hover:underline flex items-center gap-1">
              All checks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>

        {loading ? (
          <div className="h-8 flex items-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F6E56] border-t-transparent" />
          </div>
        ) : recent.length === 0 ? (
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
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-[#444441]">{c.recyclerName}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-[#444441]/60">{c.producerName}</td>
                  <td className="py-2.5 pr-4 text-[#444441]/50 text-xs">{c.processingDate}</td>
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

// ─── Recycler dashboard ───────────────────────────────────────────────────────

function RecyclerDashboard() {
  const { user, token } = useAuth();
  const [docs, setDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    listMyDocs(token).then(setDocs).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const recent = docs.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#444441]">
          Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-[#444441]/60">Recycler compliance portal — document management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon={<FolderOpen className="h-5 w-5 text-[#0F6E56]" />}
          title="Document Vault"
          desc="Store registration, GST and processing receipts in one secure place."
          href="/vault"
          cta="Go to vault"
          accent
        />
        <QuickAction
          icon={<Recycle className="h-5 w-5 text-[#0F6E56]" />}
          title="My Certificates"
          desc="View processing certificates and recycling records issued by your facility."
          href="/vault"
          cta="View certificates"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent documents</CardTitle>
            <Link href="/vault" className="text-xs text-[#0F6E56] hover:underline flex items-center gap-1">
              All documents <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>

        {loading ? (
          <div className="h-8 flex items-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0F6E56] border-t-transparent" />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[#444441]/40 mb-3">No documents uploaded yet.</p>
            <Link href="/vault">
              <Button variant="primary">Upload your first document</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#444441]/40 border-b border-black/5">
                <th className="pb-2 font-medium">Document</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Recycler</th>
                <th className="pb-2 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#444441]/40 shrink-0" />
                      <span className="font-medium text-[#444441] truncate max-w-[180px]">{d.displayName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-[#444441]/60 text-xs">{d.docType.replace(/_/g, " ")}</td>
                  <td className="py-2.5 pr-4 text-[#444441]/60">{d.recyclerName}</td>
                  <td className="py-2.5 text-[#444441]/50 text-xs">
                    {new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CredentialChecksCard />
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function QuickAction({ icon, title, desc, href, cta, accent }: {
  icon: React.ReactNode; title: string; desc: string; href: string; cta: string; accent?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="rounded-lg bg-[#0F6E56]/10 p-2">{icon}</div>
        <h2 className="font-semibold text-sm text-[#444441]">{title}</h2>
      </div>
      <p className="text-xs text-[#444441]/60 leading-relaxed flex-1">{desc}</p>
      <Link href={href}>
        <Button variant={accent ? "accent" : "primary"} className="w-full text-xs">
          {cta}
        </Button>
      </Link>
    </Card>
  );
}

function RiskPill({ rating }: { rating: string | null }) {
  if (!rating) return <span className="text-xs text-[#444441]/30">—</span>;
  const cls = {
    LOW:    "bg-[#3B6D11]/10 text-[#3B6D11]",
    MEDIUM: "bg-[#854F0B]/10 text-[#854F0B]",
    HIGH:   "bg-[#A32D2D]/10 text-[#A32D2D]",
  }[rating] ?? "bg-black/5 text-[#444441]/50";
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      {rating}
    </span>
  );
}
