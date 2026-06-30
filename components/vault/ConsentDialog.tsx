"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  onAccept: (acceptedAt: string) => void;
}

export function ConsentDialog({ onAccept }: Props) {
  const [checked, setChecked] = useState(false);

  function accept() {
    onAccept(new Date().toISOString());
  }

  return (
    <div className="rounded-xl border border-[#0F6E56]/20 bg-[#0F6E56]/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[#0F6E56] shrink-0" />
        <h2 className="font-semibold text-[#444441]">Document vault — disclosure</h2>
      </div>
      <div className="text-sm text-[#444441]/80 space-y-2 leading-relaxed">
        <p>
          Documents you upload are stored for <strong>your own filing convenience</strong>.
          No document is shared with any third party today.
        </p>
        <p>
          In a future product update, you may be able to use stored documents as
          verification evidence in an E-PRid risk check. If this capability is added,
          you will be informed before any document is used in that way.
        </p>
        <p>
          By uploading, you confirm you have the right to store these documents and
          you accept the above terms. This acceptance is logged with a timestamp as
          part of the audit trail.
        </p>
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-[#0F6E56]"
        />
        <span className="text-sm text-[#444441]">
          I understand and accept the above disclosure.
        </span>
      </label>
      <Button variant="primary" disabled={!checked} onClick={accept}>
        Accept and continue
      </Button>
    </div>
  );
}
