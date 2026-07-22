"use client";

import { formatPaiseAsINR } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

export function CurrencyDisplay({
  amountInPaise,
  className,
  showPlus = false,
  signed = false,
  size = "md",
}) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
  }[size];

  return (
    <span
      className={cn(
        "font-medium tabular-nums tracking-tight",
        sizeClass,
        className
      )}
    >
      {formatPaiseAsINR(amountInPaise, { showPlus, signed })}
    </span>
  );
}
