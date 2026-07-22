"use client";

import { Badge } from "@/components/ui/badge";
import { AccountAvatar } from "@/components/money/AccountIcon";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { cn } from "@/lib/utils";

export function AllocationRow({
  accountId,
  label,
  shortLabel,
  addingInPaise,
  isTopUp = false,
  capReached = false,
  reduced = false,
  desiredInPaise,
}) {
  const hasAddition = addingInPaise > 0;
  const addLabel = isTopUp ? "Top-up" : "Adding";

  return (
    <article className="rounded-[1.35rem] border border-border/80 bg-card p-4 shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <AccountAvatar accountId={accountId} className="size-11" iconClassName="size-5" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground">
                {label}
              </h3>
              {shortLabel ? (
                <p className="truncate text-xs text-muted-foreground">
                  {shortLabel}
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {isTopUp ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Top-up
                  </Badge>
                ) : null}
                {capReached ? (
                  <Badge variant="outline" className="text-[10px]">
                    Cap reached
                  </Badge>
                ) : null}
                {reduced ? (
                  <Badge
                    variant="secondary"
                    className="bg-[oklch(0.95_0.04_85)] text-[oklch(0.45_0.1_75)] text-[10px]"
                  >
                    Less than planned
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <CurrencyDisplay
                amountInPaise={addingInPaise}
                showPlus={hasAddition}
                size="sm"
                className={cn(
                  "text-base font-bold",
                  hasAddition
                    ? reduced
                      ? "text-[oklch(0.45_0.1_75)]"
                      : "text-income"
                    : "text-muted-foreground"
                )}
              />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {addLabel}
              </p>
              {reduced ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Planned{" "}
                  <CurrencyDisplay
                    amountInPaise={desiredInPaise}
                    size="sm"
                    className="inline text-[10px] font-medium"
                  />
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
