"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Download, Trash2, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { deleteDoc, downloadDoc } from "@/lib/api/vault";
import { VAULT_DOC_TYPE_LABELS, type VaultDocument } from "@/lib/api/types";

interface Props {
  docs: VaultDocument[];
  token: string;
  onDeleted: (id: string) => void;
}

export function VaultDocList({ docs, token, onDeleted }: Props) {
  const t = useTranslations("vault.docList");
  const locale = useLocale();
  const [downloading, setDownloading] = useState<string | null>(null);

  if (docs.length === 0) {
    return (
      <div className="text-center py-10 text-[#444441]/40 text-sm">
        {t("empty")}
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await deleteDoc(id, token);
    onDeleted(id);
  }

  async function handleDownload(doc: VaultDocument) {
    setDownloading(doc.id);
    try {
      await downloadDoc(doc.id, doc.fileName, token);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("downloadFailed"));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <Card key={doc.id} className="flex items-start gap-4 p-4">
          <div className="rounded-lg bg-[#0F6E56]/10 p-2 shrink-0">
            <FileText className="h-5 w-5 text-[#0F6E56]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-[#444441] truncate">{doc.displayName}</p>
            <p className="text-xs text-[#444441]/50 mt-0.5">
              {VAULT_DOC_TYPE_LABELS[doc.docType]} · {doc.fileName} · {fmtSize(doc.fileSizeBytes)}
            </p>
            {doc.notes && (
              <p className="text-xs text-[#444441]/50 mt-1 italic">{doc.notes}</p>
            )}
            <p className="text-xs text-[#444441]/30 mt-1">
              {t("uploadedOn", {
                date: new Date(doc.uploadedAt).toLocaleDateString(`${locale}-IN`, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownload(doc)}
              disabled={downloading === doc.id}
              className="p-1.5 rounded-md text-[#444441]/40 hover:text-[#0F6E56] hover:bg-[#0F6E56]/5 transition-colors disabled:opacity-40"
              title={t("download")}
            >
              <Download className={`h-4 w-4 ${downloading === doc.id ? "animate-pulse" : ""}`} />
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-1.5 rounded-md text-[#444441]/40 hover:text-[#A32D2D] hover:bg-[#A32D2D]/5 transition-colors"
              title={t("remove")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
