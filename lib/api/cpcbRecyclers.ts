import { apiFetch } from "./client";
import type { CpcbIngestionSummaryDto, CpcbRecyclerSearchResult } from "./types";

export interface CpcbRecyclerSearchParams {
  name?: string;
  gst?: string;
  stateId?: string;
}

export const searchCpcbRecyclers = (params: CpcbRecyclerSearchParams, token: string) => {
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.gst) query.set("gst", params.gst);
  if (params.stateId) query.set("stateId", params.stateId);
  const qs = query.toString();
  return apiFetch<CpcbRecyclerSearchResult[]>(
    `/api/v1/cpcb-recyclers/search${qs ? `?${qs}` : ""}`,
    {},
    token
  );
};

export const ingestCpcbRecyclerCsv = (file: File, token: string) => {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<CpcbIngestionSummaryDto>(
    "/api/v1/cpcb-recyclers/ingest",
    { method: "POST", body: form },
    token
  );
};
