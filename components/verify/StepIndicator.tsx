import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                i < current
                  ? "bg-[#0F6E56] border-[#0F6E56] text-white"
                  : i === current
                  ? "border-[#0F6E56] text-[#0F6E56] bg-white"
                  : "border-black/20 text-[#444441]/40 bg-white"
              )}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "mt-1 text-xs font-medium whitespace-nowrap",
                i === current ? "text-[#0F6E56]" : "text-[#444441]/50"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 mb-5 transition-colors",
                i < current ? "bg-[#0F6E56]" : "bg-black/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
