"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface Props {
  onSearch: (params: { name?: string; gst?: string; stateId?: string }) => void;
  loading: boolean;
}

export function CpcbRecyclerSearchForm({ onSearch, loading }: Props) {
  const t = useTranslations("cpcbDirectory");
  const [name, setName] = useState("");
  const [gst, setGst] = useState("");
  const [stateId, setStateId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      name: name.trim() || undefined,
      gst: gst.trim() || undefined,
      stateId: stateId.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("searchByName")}
        className="sm:col-span-2 rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
      <input
        value={gst}
        onChange={(e) => setGst(e.target.value)}
        placeholder={t("searchByGst")}
        className="rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
      <input
        value={stateId}
        onChange={(e) => setStateId(e.target.value)}
        placeholder={t("searchByState")}
        className="rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
      <Button type="submit" variant="primary" loading={loading} className="sm:col-span-4 flex items-center justify-center gap-1.5">
        <Search className="h-4 w-4" /> {t("search")}
      </Button>
    </form>
  );
}
