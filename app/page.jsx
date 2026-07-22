"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MoneyKitLogo } from "@/components/brand/MoneyKitLogo";
import { BalanceCard } from "@/components/money/BalanceCard";
import { TransactionItem } from "@/components/money/TransactionItem";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ExpenseDialog } from "@/components/forms/ExpenseDialog";
import { useMoney } from "@/hooks/useMoney";
import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { getGreeting } from "@/lib/utils/dates";

export default function HomePage() {
  const {
    isLoading,
    error,
    refreshData,
    accounts,
    transactions,
    primaryAccount,
    totalBalanceInPaise,
  } = useMoney();
  const [expenseOpen, setExpenseOpen] = useState(false);

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

  const recent = transactions.slice(0, 5);
  const hasData = transactions.length > 0 || totalBalanceInPaise > 0;
  const accountsById = Object.fromEntries(
    accounts.map((account) => [account.id, account])
  );

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-heading text-[1.75rem] font-extrabold tracking-tight text-foreground sm:text-3xl">
            {getGreeting()}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Your money today.
          </p>
        </div>
        <MoneyKitLogo
          variant="badge"
          badgeSize="lg"
          priority
          className="md:hidden"
        />
      </div>

      {!hasData ? (
        <EmptyState
          icon="money"
          title="Add your first amount"
          description="Tap Add Money to start."
          actionLabel="Add Money"
          actionHref="/add-money"
        />
      ) : (
        <div className="space-y-8">
          <BalanceCard
            account={primaryAccount}
            onAddExpense={() => setExpenseOpen(true)}
          />

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Recent activity
              </h2>
              <Link
                href="/activity"
                className="text-sm font-semibold text-primary"
              >
                See details →
              </Link>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-card px-4 shadow-soft">
              <div className="divide-y divide-border/70 stagger-children">
                {recent.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    accountName={
                      accountsById[transaction.accountId]?.name || "Account"
                    }
                    compact
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        initialAccountId={primaryAccount?.id ?? ACCOUNT_IDS.myDaily}
      />
    </AppShell>
  );
}
