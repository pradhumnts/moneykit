"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatNumberInputDisplay,
  parseINRInputToRupees,
} from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

export function AmountInput({
  id = "amount",
  label = "Amount",
  value,
  onValueChange,
  error,
  helperText,
  autoFocus = false,
  large = false,
}) {
  const display = useMemo(() => {
    if (value === null || value === undefined || value === "") return "";
    return formatNumberInputDisplay(String(value));
  }, [value]);

  function handleChange(event) {
    const raw = event.target.value.replace(/₹/g, "").replace(/,/g, "").trim();

    if (raw === "") {
      onValueChange("");
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(raw)) {
      return;
    }

    onValueChange(raw);
  }

  const parsed = parseINRInputToRupees(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      <div
        className={cn(
          "flex items-center rounded-[1.5rem] border border-border bg-card px-5 shadow-soft focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15",
          large && "min-h-[5.25rem]",
          error && "border-destructive focus-within:ring-destructive/20"
        )}
      >
        <span
          className={cn(
            "pr-2 font-bold text-muted-foreground",
            large ? "text-4xl" : "text-xl"
          )}
        >
          ₹
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          value={display}
          onChange={handleChange}
          placeholder="0"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-help` : undefined
          }
          className={cn(
            "h-auto border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
            large
              ? "text-4xl font-extrabold tabular-nums text-foreground"
              : "text-xl font-bold tabular-nums text-foreground"
          )}
        />
      </div>
      {helperText && !error ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {parsed !== null && large ? (
        <p className="sr-only">Parsed amount {parsed} rupees</p>
      ) : null}
    </div>
  );
}
