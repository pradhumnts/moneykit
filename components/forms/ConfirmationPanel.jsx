"use client";

import { Button } from "@/components/ui/button";
import { BottomActionBar, ActionButton } from "@/components/forms/BottomActionBar";

export function ConfirmationPanel({
  title,
  description,
  rows,
  onBack,
  onConfirm,
  confirmLabel = "Confirm",
  isLoading = false,
  embedded = false,
}) {
  return (
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-border/80 bg-muted/40">
        <div className="divide-y divide-border/70">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="max-w-[60%] text-right font-semibold text-foreground">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomActionBar embedded={embedded}>
        <Button
          type="button"
          variant="outline"
          className="min-h-12 flex-1"
          onClick={onBack}
          disabled={isLoading}
        >
          Edit
        </Button>
        <ActionButton type="button" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Saving…" : confirmLabel}
        </ActionButton>
      </BottomActionBar>
    </div>
  );
}
