"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AllocationHistoryBreakdown } from "@/components/money/AllocationHistoryBreakdown";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { useMoney } from "@/hooks/useMoney";
import {
  formatDateInTimezone,
  formatDisplayDate,
} from "@/lib/utils/dates";

export default function AllocationDetailPage() {
  const params = useParams();
  const allocationId = params?.allocationId;
  const {
    isLoading,
    error,
    refreshData,
    allocations,
    allocationItems,
  } = useMoney();

  const allocation = useMemo(
    () => allocations.find((entry) => entry.id === allocationId) || null,
    [allocations, allocationId]
  );

  const items = useMemo(
    () =>
      allocationItems.filter((item) => item.allocationId === allocationId),
    [allocationItems, allocationId]
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

  if (!allocation) {
    return (
      <AppShell>
        <Link
          href="/settings/allocations"
          className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Money added
        </Link>
        <EmptyState
          icon="money"
          title="Entry not found"
          description="This Add Money entry may have been removed."
          actionLabel="Back to list"
          actionHref="/settings/allocations"
        />
      </AppShell>
    );
  }

  const dateLabel = formatDisplayDate(allocation.transactionDate);
  const timeLabel = formatDateInTimezone(allocation.createdAt, "time");

  return (
    <AppShell>
      <Link
        href="/settings/allocations"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Money added
      </Link>

      <PageHeader
        title="Money added"
        description={[dateLabel, timeLabel].filter(Boolean).join(" · ")}
      />

      <div className="space-y-5">
        <Card className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft">
          <CardContent className="space-y-2 p-5 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">Received</p>
            <CurrencyDisplay
              amountInPaise={allocation.originalAmountInPaise}
              size="xl"
              className="font-extrabold tracking-tight text-foreground"
            />
            {allocation.note ? (
              <p className="pt-1 text-sm text-muted-foreground">
                {allocation.note}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <AllocationHistoryBreakdown items={items} />
      </div>
    </AppShell>
  );
}
