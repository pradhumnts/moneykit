"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, ChevronRight, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { useMoney } from "@/hooks/useMoney";
import {
  formatDateInTimezone,
  formatDisplayDate,
} from "@/lib/utils/dates";

export default function AllocationsSettingsPage() {
  const { isLoading, error, refreshData, allocations } = useMoney();

  const sortedAllocations = useMemo(
    () =>
      [...allocations].sort((a, b) =>
        (a.createdAt || "") < (b.createdAt || "") ? 1 : -1
      ),
    [allocations]
  );

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState description={error} onRetry={refreshData} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href="/settings"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Settings
      </Link>

      <PageHeader
        title="Money added"
        description="Past entries and how each was split"
      />

      {sortedAllocations.length === 0 ? (
        <EmptyState
          icon="money"
          title="No money added yet"
          description="When you add money, each entry and its split will show up here."
          actionLabel="Add money"
          actionHref="/add-money"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-soft">
          <ul className="divide-y divide-border/70">
            {sortedAllocations.map((allocation) => {
              const dateLabel = formatDisplayDate(allocation.transactionDate);
              const timeLabel = formatDateInTimezone(
                allocation.createdAt,
                "time"
              );

              return (
                <li key={allocation.id}>
                  <Link
                    href={`/settings/allocations/${allocation.id}`}
                    className="flex min-h-16 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <PlusCircle className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CurrencyDisplay
                        amountInPaise={allocation.originalAmountInPaise}
                        size="sm"
                        className="text-sm font-semibold text-foreground"
                      />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dateLabel}
                        {timeLabel ? ` · ${timeLabel}` : ""}
                      </p>
                      {allocation.note ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {allocation.note}
                        </p>
                      ) : null}
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
