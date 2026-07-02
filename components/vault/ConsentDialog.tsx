"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  onAccept: (acceptedAt: string) => void;
}

export function ConsentDialog({ onAccept }: Props) {
  const t = useTranslations("vault.consent");
  const [checked, setChecked] = useState(false);

  function accept() {
    onAccept(new Date().toISOString());
  }

  return (
    <div className="rounded-xl border border-[#0F6E56]/20 bg-[#0F6E56]/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[#0F6E56] shrink-0" />
        <h2 className="font-semibold text-[#444441]">{t("title")}</h2>
      </div>
      <div className="text-sm text-[#444441]/80 space-y-2 leading-relaxed">
        <p>{t.rich("p1", { strong: (chunks) => <strong>{chunks}</strong> })}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-[#0F6E56]"
        />
        <span className="text-sm text-[#444441]">
          {t("checkboxLabel")}
        </span>
      </label>
      <Button variant="primary" disabled={!checked} onClick={accept}>
        {t("accept")}
      </Button>
    </div>
  );
}
