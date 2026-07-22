"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountCard } from "@/components/money/AccountCard";
import { DailyExpenseCard } from "@/components/money/DailyExpenseCard";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useMoney } from "@/hooks/useMoney";
import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { OVERVIEW_ACCOUNT_IDS } from "@/constants/accounts";

export default function BalancesSettingsPage() {
  const { isLoading, error, refreshData, getAccountById } = useMoney();

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

  const myDaily = getAccountById(ACCOUNT_IDS.myDaily);
  const wifeDaily = getAccountById(ACCOUNT_IDS.wifeDaily);
  const otherAccounts = OVERVIEW_ACCOUNT_IDS.map((id) =>
    getAccountById(id)
  ).filter(Boolean);

  return (
    <AppShell>
      <Link
        href="/settings"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Settings
      </Link>

      <PageHeader title="Balances" />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Daily Expense
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {myDaily ? <DailyExpenseCard account={myDaily} /> : null}
            {wifeDaily ? <DailyExpenseCard account={wifeDaily} /> : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Categories
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
