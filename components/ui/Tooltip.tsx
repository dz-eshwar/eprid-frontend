"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<"top" | "bottom">("top");
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // If less than 120px from top of viewport, show below
      setPos(rect.top < 120 ? "bottom" : "top");
    }
    setVisible(true);
  }

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      onFocus={handleMouseEnter}
      onBlur={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 w-72 rounded-lg bg-[#444441] px-3 py-2.5 text-xs text-white leading-relaxed shadow-lg pointer-events-none",
            "left-1/2 -translate-x-1/2",
            pos === "top"
              ? "bottom-full mb-2"
              : "top-full mt-2"
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
              pos === "top"
                ? "top-full border-t-[#444441]"
                : "bottom-full border-b-[#444441]"
            )}
          />
        </div>
      )}
    </div>
  );
}
