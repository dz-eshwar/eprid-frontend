"use client";

import { Fragment, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VaultUploadForm } from "./VaultUploadForm";
import type { VaultDocTypeInfo, VaultDocument, VaultDocType } from "@/lib/api/types";

interface Props {
  docTypes: VaultDocTypeInfo[];
  docs: VaultDocument[];
  recyclerId: string;
  consentAcceptedAt: string | null;
  token: string;
  onNeedRecycler: () => void;
  onNeedConsent: () => void;
  onUploaded: (doc: VaultDocument) => void;
}

export function DocTypeTable({
  docTypes, docs, recyclerId, consentAcceptedAt, token,
  onNeedRecycler, onNeedConsent, onUploaded,
}: Props) {
  const [expandedType, setExpandedType] = useState<VaultDocType | null>(null);

  function handleUploadClick(type: VaultDocType) {
    if (!recyclerId) { onNeedRecycler(); return; }
    if (!consentAcceptedAt) { onNeedConsent(); return; }
    setExpandedType(expandedType === type ? null : type);
  }

  function handleUploaded(doc: VaultDocument) {
    onUploaded(doc);
    setExpandedType(null);
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 bg-[#F9F9F8]">
            <th className="text-left px-4 py-3 font-medium text-[#444441]/50 text-xs uppercase tracking-wide">
              Document type
            </th>
            <th className="text-center px-4 py-3 font-medium text-[#444441]/50 text-xs uppercase tracking-wide w-24">
              Uploaded
            </th>
            <th className="px-4 py-3 w-28" />
          </tr>
        </thead>
        <tbody>
          {docTypes.map((dt, i) => {
            const count = docs.filter((d) => d.docType === dt.type).length;
            const isExpanded = expandedType === dt.type;
            return (
              <Fragment key={dt.type}>
                <tr className={[
                  i !== 0 ? "border-t border-black/5" : "",
                  isExpanded ? "bg-[#0F6E56]/5" : "hover:bg-black/[0.015]",
                ].join(" ")}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-[#0F6E56]/10 p-1.5 shrink-0">
                        <FileText className="h-4 w-4 text-[#0F6E56]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#444441]">{dt.label}</p>
                        {dt.description && (
                          <p className="text-xs text-[#444441]/45 mt-0.5">{dt.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={count > 0 ? "text-[#0F6E56] font-semibold" : "text-[#444441]/25"}>
                      {count}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="outline"
                      onClick={() => handleUploadClick(dt.type)}
                      className="text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                    >
                      {isExpanded ? (
                        <><X className="h-3 w-3" /> Cancel</>
                      ) : (
                        <><Upload className="h-3 w-3" /> Upload</>
                      )}
                    </Button>
                  </td>
                </tr>
                {isExpanded && consentAcceptedAt && (
                  <tr className="border-t border-[#0F6E56]/15">
                    <td colSpan={3} className="px-5 py-4 bg-[#0F6E56]/[0.03]">
                      <VaultUploadForm
                        recyclerId={recyclerId}
                        consentAcceptedAt={consentAcceptedAt}
                        token={token}
                        lockedDocType={dt.type}
                        onUploaded={handleUploaded}
                        onCancel={() => setExpandedType(null)}
                        compact
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
