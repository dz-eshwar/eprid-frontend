"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" && "bg-[#0F6E56] text-white hover:opacity-90 focus-visible:ring-[#0F6E56]",
          variant === "accent" && "bg-[#D85A30] text-white hover:opacity-90 focus-visible:ring-[#D85A30]",
          variant === "outline" && "border border-[#0F6E56] text-[#0F6E56] bg-transparent hover:bg-[#0F6E56]/5",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
