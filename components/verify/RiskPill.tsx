import { cn } from "@/lib/utils";
import type { RiskRating } from "@/lib/api/types";

export function RiskPill({ rating }: { rating: RiskRating | null }) {
  if (!rating) return <span className="text-xs text-[#444441]/30">—</span>;
  const cls = {
    LOW:      "bg-[#3B6D11]/10 text-[#3B6D11]",
    MEDIUM:   "bg-[#854F0B]/10 text-[#854F0B]",
    HIGH:     "bg-[#A32D2D]/10 text-[#A32D2D]",
    CRITICAL: "bg-[#A32D2D] text-white",
  }[rating];
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      {rating}
    </span>
  );
}
