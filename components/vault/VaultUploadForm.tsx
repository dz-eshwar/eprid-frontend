"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { uploadDoc } from "@/lib/api/vault";
import {
  VAULT_DOC_TYPE_LABELS,
  type VaultDocType,
  type VaultDocTypeInfo,
  type VaultDocument,
} from "@/lib/api/types";

interface Props {
  recyclerId: string;
  consentAcceptedAt: string;
  token: string;
  onUploaded: (doc: VaultDocument) => void;
  docTypes?: VaultDocTypeInfo[];
  lockedDocType?: VaultDocType;
  onCancel?: () => void;
  compact?: boolean;
}

type Phase = "form" | "success";

const FALLBACK_TYPES: VaultDocTypeInfo[] = (
  Object.keys(VAULT_DOC_TYPE_LABELS) as VaultDocType[]
).map((type) => ({ type, label: VAULT_DOC_TYPE_LABELS[type], description: "" }));

export function VaultUploadForm({
  recyclerId, consentAcceptedAt, token, onUploaded,
  docTypes, lockedDocType, onCancel, compact,
}: Props) {
  const types = docTypes ?? FALLBACK_TYPES;

  const [phase, setPhase] = useState<Phase>("form");
  const [lastDoc, setLastDoc] = useState<VaultDocument | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<VaultDocType>(
    lockedDocType ?? (types[0]?.type ?? "REGISTRATION_CERT")
  );
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setFile(null);
    setDisplayName("");
    setNotes("");
    setError(null);
    setDocType(lockedDocType ?? (types[0]?.type ?? "REGISTRATION_CERT"));
    const el = document.getElementById("vault-file") as HTMLInputElement;
    if (el) el.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const doc = await uploadDoc(
        file, recyclerId, lockedDocType ?? docType,
        displayName || file.name, consentAcceptedAt, notes || undefined, token
      );
      onUploaded(doc);
      setLastDoc(doc);
      setPhase("success");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  const successContent = lastDoc && (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#0F6E56] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-[#444441] text-sm">{lastDoc.displayName} uploaded</p>
          <p className="text-xs text-[#444441]/50 mt-0.5">
            {VAULT_DOC_TYPE_LABELS[lastDoc.docType]} · {(lastDoc.fileSizeBytes / 1024).toFixed(0)} KB
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => setPhase("form")}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Add another document
      </Button>
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!lockedDocType && (
        <div>
          <label className="block text-sm font-medium text-[#444441] mb-1.5">Document type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as VaultDocType)}
            className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
          >
            {types.map((dt) => (
              <option key={dt.type} value={dt.type}>{dt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#444441] mb-1.5">
          Display name <span className="font-normal text-[#444441]/50">(optional — defaults to filename)</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. BWMR Reg Cert 2024"
          className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#444441] mb-1.5">
          File <span className="text-[#A32D2D]">*</span>
        </label>
        <input
          id="vault-file"
          type="file"
          required
          accept=".jpg,.jpeg,.png,.webp,.tiff,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-[#444441]/70 file:mr-3 file:rounded-md file:border-0 file:bg-[#0F6E56] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
        />
        <p className="mt-1 text-xs text-[#444441]/40">JPEG, PNG, WebP, TIFF, PDF · max 20 MB</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#444441] mb-1.5">
          Notes <span className="font-normal text-[#444441]/50">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Any reference notes for your own use"
          className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={loading} disabled={!file} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload document
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-[#444441]/50 hover:text-[#444441] transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const body = phase === "success" ? successContent : formContent;

  if (compact) return <>{body}</>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lockedDocType
            ? `Upload ${VAULT_DOC_TYPE_LABELS[lockedDocType]}`
            : phase === "success" ? "Document uploaded" : "Upload a document"}
        </CardTitle>
      </CardHeader>
      {body}
    </Card>
  );
}
