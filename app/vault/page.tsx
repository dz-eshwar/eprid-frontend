"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConsentDialog } from "@/components/vault/ConsentDialog";
import { VaultUploadForm } from "@/components/vault/VaultUploadForm";
import { VaultDocList } from "@/components/vault/VaultDocList";
import { useAuth } from "@/lib/auth/AuthContext";
import { listMyDocs, listDocTypes } from "@/lib/api/vault";
import { getMyRecyclerProfile } from "@/lib/api/recyclers";
import {
  VAULT_DOC_TYPE_LABELS,
  type VaultDocType,
  type VaultDocTypeInfo,
  type VaultDocument,
} from "@/lib/api/types";

const FALLBACK_DOC_TYPES: VaultDocTypeInfo[] = (
  Object.keys(VAULT_DOC_TYPE_LABELS) as VaultDocType[]
).map((type) => ({ type, label: VAULT_DOC_TYPE_LABELS[type], description: "" }));

export default function VaultPage() {
  const { token, user } = useAuth();
  const isRecycler = user?.role === "RECYCLER";

  const [docs, setDocs] = useState<VaultDocument[]>([]);
  const [docTypes, setDocTypes] = useState<VaultDocTypeInfo[]>(FALLBACK_DOC_TYPES);
  const [loading, setLoading] = useState(true);
  const [consentAcceptedAt, setConsentAcceptedAt] = useState<string | null>(null);
  const [recyclerId, setRecyclerId] = useState("");
  const [recyclerIdInput, setRecyclerIdInput] = useState("");
  const [showConsent, setShowConsent] = useState(false);
  const recyclerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetches: Promise<unknown>[] = [
      listMyDocs(token).then((myDocs) => {
        setDocs(myDocs);
        if (myDocs.length > 0) setConsentAcceptedAt(myDocs[0].consentAcceptedAt);
      }),
      listDocTypes(token).catch(() => null).then((types) => {
        if (types) setDocTypes(types as VaultDocTypeInfo[]);
      }),
    ];
    if (isRecycler) {
      fetches.push(
        getMyRecyclerProfile(token)
          .then((profile) => setRecyclerId(profile.id))
          .catch(() => {})
      );
    }
    Promise.all(fetches).finally(() => setLoading(false));
  }, [token]);

  function handleNeedRecycler() {
    recyclerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    (recyclerRef.current?.querySelector("input") as HTMLInputElement | null)?.focus();
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex rounded-full bg-[#0F6E56]/10 p-4 mb-6">
          <FolderOpen className="h-10 w-10 text-[#0F6E56]" />
        </div>
        <h1 className="text-2xl font-bold text-[#444441] mb-3">Sign in to access your vault</h1>
        <p className="text-[#444441]/70 mb-8 leading-relaxed">
          The document vault is a private space for recyclers to store registration, GST, and processing receipts.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="primary">Log in</Button></Link>
          <Link href="/register"><Button variant="outline">Sign up</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#444441]">Document Vault</h1>
        <p className="mt-1 text-sm text-[#444441]/60">
          Store registration, GST certificates and processing receipts in one place.
        </p>
      </div>

      {/* Recycler picker — only for non-recycler roles (consultants, producers) */}
      {!isRecycler && (
        <div ref={recyclerRef} className="rounded-xl border border-black/10 bg-white p-4">
          {recyclerId ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#444441]/40 uppercase tracking-wide">Vault for recycler</p>
                <p className="text-sm font-mono text-[#444441] mt-0.5 break-all">{recyclerId}</p>
              </div>
              <Button
                variant="outline"
                className="text-xs py-1.5 px-3 shrink-0"
                onClick={() => { setRecyclerId(""); setRecyclerIdInput(""); setShowConsent(false); }}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#444441]">Which recycler is this vault for?</p>
              <p className="text-xs text-[#444441]/45">
                Enter the recycler ID from a previous verification check.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recyclerIdInput}
                  onChange={(e) => setRecyclerIdInput(e.target.value)}
                  placeholder="Recycler ID (UUID)"
                  className="flex-1 rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
                <Button
                  variant="primary"
                  onClick={() => setRecyclerId(recyclerIdInput.trim())}
                  disabled={!recyclerIdInput.trim()}
                >
                  Set
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consent */}
      {recyclerId && !consentAcceptedAt && showConsent && (
        <ConsentDialog
          onAccept={(ts) => { setConsentAcceptedAt(ts); setShowConsent(false); }}
        />
      )}

      {/* Upload form — shown after recycler set + consent accepted */}
      {!loading && recyclerId && consentAcceptedAt && (
        <VaultUploadForm
          recyclerId={recyclerId}
          consentAcceptedAt={consentAcceptedAt}
          token={token}
          docTypes={docTypes}
          onUploaded={(doc) => setDocs((prev) => [doc, ...prev])}
        />
      )}

      {/* Prompt consent if recycler set but not yet accepted */}
      {!loading && recyclerId && !consentAcceptedAt && !showConsent && (
        <div className="rounded-xl border border-black/10 bg-white p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-[#444441]/70">Accept the disclosure to start uploading documents.</p>
          <Button variant="primary" className="shrink-0" onClick={() => setShowConsent(true)}>
            Review &amp; accept
          </Button>
        </div>
      )}

      {/* Prompt recycler ID if not set (non-recycler roles only) */}
      {!loading && !isRecycler && !recyclerId && (
        <div className="rounded-xl border border-dashed border-black/15 p-5 text-center">
          <p className="text-sm text-[#444441]/50">Set a recycler ID above to upload documents.</p>
          <button
            className="mt-2 text-sm text-[#0F6E56] hover:underline"
            onClick={handleNeedRecycler}
          >
            Set recycler ID
          </button>
        </div>
      )}

      {/* Document list */}
      {!loading && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#444441]/50 uppercase tracking-wide">
            Your documents ({docs.length})
          </h2>
          <VaultDocList
            docs={docs}
            token={token}
            onDeleted={(id) => setDocs((prev) => prev.filter((d) => d.id !== id))}
          />
        </div>
      )}
    </div>
  );
}
