"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, Image, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { uploadEvidence } from "@/lib/api/checks";
import {
  EVIDENCE_TYPE_HINTS,
  EVIDENCE_TYPE_LABELS,
  type EvidenceType,
  type EvidenceUploadResponse,
  type VerificationCheckResponse,
} from "@/lib/api/types";

interface FileEntry {
  file: File;
  type: EvidenceType;
}

interface Props {
  check: VerificationCheckResponse;
  token: string;
  onComplete: (result: EvidenceUploadResponse) => void;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"];
const MAX_FILES = 10;
const MAX_SIZE_MB = 20;

const ALL_TYPES = Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[];

/** Guess the most likely evidence type from filename / mime type */
function inferType(file: File): EvidenceType {
  const name = file.name.toLowerCase();
  if (name.includes("weighbridge") || name.includes("weight")) return "WEIGHBRIDGE_SLIP";
  if (name.includes("invoice") || name.includes("bill")) return "INVOICE";
  if (name.includes("cert") || name.includes("registration") || name.includes("auth")) return "REGISTRATION_CERTIFICATE";
  if (name.includes("audit") || name.includes("report")) return "AUDIT_REPORT";
  if (file.type.startsWith("image/")) return "SITE_PHOTO";
  return "OTHER";
}

export function EvidenceUpload({ check, token, onComplete }: Props) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const errors: string[] = [];
    const valid: FileEntry[] = [];

    Array.from(incoming).forEach((f) => {
      if (!ALLOWED.includes(f.type)) {
        errors.push(`"${f.name}" — unsupported type`);
      } else if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`"${f.name}" — exceeds ${MAX_SIZE_MB} MB`);
      } else {
        valid.push({ file: f, type: inferType(f) });
      }
    });

    setEntries((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_FILES);
      if (errors.length) setError(errors.join("; "));
      return next;
    });
  }, []);

  function setType(index: number, type: EvidenceType) {
    setEntries((prev) => prev.map((e, i) => i === index ? { ...e, type } : e));
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSubmit() {
    if (entries.length === 0) { setError("Add at least one file"); return; }
    setError(null);
    setLoading(true);
    try {
      const result = await uploadEvidence(
        check.id,
        entries.map((e) => e.file),
        entries.map((e) => e.type),
        token
      );
      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload evidence</CardTitle>
        <p className="text-sm text-[#444441]/60 mt-1">
          Add up to {MAX_FILES} files. Label each one so we apply the right date checks —
          a registration certificate from 2022 shouldn&apos;t be flagged just because it predates this batch.
        </p>
      </CardHeader>

      {/* Date tolerance legend */}
      <div className="mb-4 rounded-lg bg-[#F1EFE8] p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-[#444441]/40 shrink-0 mt-0.5" />
        <div className="text-xs text-[#444441]/60 space-y-0.5">
          {ALL_TYPES.map((t) => (
            <div key={t}>
              <span className="font-medium text-[#444441]/80">{EVIDENCE_TYPE_LABELS[t]}:</span>{" "}
              {EVIDENCE_TYPE_HINTS[t]}
            </div>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          dragging ? "border-[#0F6E56] bg-[#0F6E56]/5" : "border-black/15 hover:border-[#0F6E56]/40"
        )}
        onClick={() => document.getElementById("evidence-file-input")?.click()}
      >
        <input
          id="evidence-file-input"
          type="file"
          multiple
          accept={ALLOWED.join(",")}
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <Upload className="h-7 w-7 text-[#444441]/30 mx-auto mb-1.5" />
        <p className="text-sm font-medium text-[#444441]">
          Drag &amp; drop files, or <span className="text-[#0F6E56]">click to browse</span>
        </p>
        <p className="text-xs text-[#444441]/40 mt-1">
          JPEG · PNG · WebP · TIFF · PDF &nbsp;·&nbsp; {entries.length}/{MAX_FILES} added
        </p>
      </div>

      {/* File list with per-file type selector */}
      {entries.length > 0 && (
        <ul className="mt-3 space-y-2">
          {entries.map((entry, i) => (
            <li key={i} className="rounded-lg border border-black/8 bg-white overflow-hidden">
              {/* File info row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F1EFE8]">
                {entry.file.type === "application/pdf"
                  ? <FileText className="h-4 w-4 shrink-0 text-[#444441]/50" />
                  : <Image className="h-4 w-4 shrink-0 text-[#444441]/50" />}
                <span className="flex-1 text-sm truncate text-[#444441] font-medium">
                  {entry.file.name}
                </span>
                <span className="text-xs text-[#444441]/40 shrink-0">
                  {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  onClick={() => removeEntry(i)}
                  className="text-[#444441]/30 hover:text-[#A32D2D] transition-colors ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Type selector */}
              <div className="px-3 py-2 flex items-center gap-2">
                <label className="text-xs text-[#444441]/50 whitespace-nowrap">
                  Document type:
                </label>
                <select
                  value={entry.type}
                  onChange={(e) => setType(i, e.target.value as EvidenceType)}
                  className="flex-1 text-xs rounded border border-black/15 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0F6E56] text-[#444441]"
                >
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {EVIDENCE_TYPE_LABELS[t]} — {EVIDENCE_TYPE_HINTS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-4">
        <Button
          variant="accent"
          loading={loading}
          disabled={entries.length === 0}
          onClick={handleSubmit}
          className="w-full"
        >
          Run forensics checks ({entries.length} file{entries.length !== 1 ? "s" : ""})
        </Button>
      </div>
    </Card>
  );
}
