"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterChips } from "@/components/feedback/FilterChips";
import { ExpenseDialog } from "@/components/forms/ExpenseDialog";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { TransactionItem } from "@/components/money/TransactionItem";
import { Button } from "@/components/ui/button";
import { useMoney } from "@/hooks/useMoney";
import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { AccountAvatar } from "@/components/money/AccountIcon";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine", accountId: ACCOUNT_IDS.myDaily },
  { value: "wife", label: "Wife", accountId: ACCOUNT_IDS.wifeDaily },
  { value: "family", label: "Family", accountId: ACCOUNT_IDS.family },
];

export default function ExpensesPage() {
  const {
    isLoading,
    getAccountById,
    getMonthlyExpenseStats,
    transactions,
    accounts,
  } = useMoney();

  const [filter, setFilter] = useState("all");
  const [openFor, setOpenFor] = useState(null);

  const myDaily = getAccountById(ACCOUNT_IDS.myDaily);
  const wifeDaily = getAccountById(ACCOUNT_IDS.wifeDaily);
  const family = getAccountById(ACCOUNT_IDS.family);

  const accountsById = useMemo(() => {
    const map = {};
    for (const account of accounts) map[account.id] = account;
    return map;
  }, [accounts]);

  const expenseTransactions = useMemo(() => {
    let items = transactions.filter((tx) => tx.transactionType === "expense");
    const selected = FILTERS.find((item) => item.value === filter);
    if (selected?.accountId) {
      items = items.filter((tx) => tx.accountId === selected.accountId);
    } else {
      items = items.filter((tx) =>
        [ACCOUNT_IDS.myDaily, ACCOUNT_IDS.wifeDaily, ACCOUNT_IDS.family].includes(
          tx.accountId
        )
      );
    }
    return items.slice(0, 20);
  }, [transactions, filter]);

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Expenses"
        action={
          <Button
            variant="lime"
            className="min-h-11"
            onClick={() => setOpenFor(ACCOUNT_IDS.myDaily)}
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {[myDaily, wifeDaily, family].filter(Boolean).map((account) => {
          const stats = getMonthlyExpenseStats(account.id);
          return (
            <article
              key={account.id}
              className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <AccountAvatar accountId={account.id} className="size-11" iconClassName="size-5" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {account.name}
                  </h2>
                  <CurrencyDisplay
                    amountInPaise={account.balanceInPaise}
                    size="lg"
                    className="font-extrabold text-foreground"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-[1.15rem] bg-muted/70 px-3 py-3 text-xs text-muted-foreground">
                <div>
                  <p>Spent this month</p>
                  <CurrencyDisplay
                    amountInPaise={stats.spentInPaise}
                    size="sm"
                    className="font-bold text-foreground"
                  />
                </div>
                <div>
                  <p>Expenses</p>
                  <p className="text-sm font-bold text-foreground">{stats.count}</p>
                </div>
              </div>
              <Button
                className="mt-4 min-h-11 w-full"
                variant="outline"
                onClick={() => setOpenFor(account.id)}
              >
                Add expense
              </Button>
            </article>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Recent expenses
          </h2>
          <Link href="/activity" className="text-sm font-semibold text-primary">
            Full activity →
          </Link>
        </div>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
        {expenseTransactions.length === 0 ? (
          <EmptyState
            icon="expense"
            title="No expenses yet"
            description="Expenses show up here."
            actionLabel="Record an expense"
            onAction={() => setOpenFor(ACCOUNT_IDS.myDaily)}
          />
        ) : (
          <div className="rounded-[1.5rem] border border-border/80 bg-card px-4 shadow-soft">
            <div className="divide-y divide-border/70">
              {expenseTransactions.map((transaction) => (
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
        )}
      </section>

      <ExpenseDialog
        open={Boolean(openFor)}
        onOpenChange={(open) => {
          if (!open) setOpenFor(null);
        }}
        initialAccountId={openFor || ACCOUNT_IDS.myDaily}
      />
    </AppShell>
  );
}
