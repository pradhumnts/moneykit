"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { DailyExpenseCard } from "@/components/money/DailyExpenseCard";
import { TransactionList } from "@/components/money/TransactionList";
import { ExpenseDialog } from "@/components/forms/ExpenseDialog";
import { BalanceAdjustmentForm } from "@/components/forms/BalanceAdjustmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMoney } from "@/hooks/useMoney";
import { ACCOUNT_META } from "@/constants/accounts";
import { AccountAvatar } from "@/components/money/AccountIcon";

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId;
  const { isLoading, getAccountById, transactions, accounts } = useMoney();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const account = getAccountById(accountId);
  const meta = ACCOUNT_META[accountId];

  const accountsById = useMemo(() => {
    const map = {};
    for (const item of accounts) map[item.id] = item;
    return map;
  }, [accounts]);

  const accountTransactions = useMemo(
    () => transactions.filter((tx) => tx.accountId === accountId),
    [transactions, accountId]
  );

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  if (!account) {
    return (
      <AppShell>
        <ErrorState
          title="Account not found"
          description="Category not found."
          onRetry={() => router.push("/")}
        />
      </AppShell>
    );
  }

  const isDaily = account.accountType === "daily-expense";
  const isSavings =
    account.accountType === "savings" ||
    account.accountType === "future-expense";
  const canExpense =
    account.accountType === "daily-expense" ||
    account.accountType === "family-expense" ||
    account.accountType === "allocation" ||
    isSavings;

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>

      <div className="mb-6 flex items-start gap-3">
        <AccountAvatar accountId={account.id} className="size-14" iconClassName="size-6" />
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            {account.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {meta?.shortLabel || "Account"}
          </p>
        </div>
      </div>

      {isDaily ? (
        <div className="mb-6">
          <DailyExpenseCard account={account} />
        </div>
      ) : (
        <Card className="mb-6 border-border/70">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">Current balance</p>
              <CurrencyDisplay amountInPaise={account.balanceInPaise} size="xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Total added</p>
                <CurrencyDisplay
                  amountInPaise={account.totalAddedInPaise || 0}
                />
              </div>
              <div className="rounded-2xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Total spent</p>
                <CurrencyDisplay
                  amountInPaise={account.totalSpentInPaise || 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isDaily ? null : (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/70 bg-card p-3">
            <p className="text-xs text-muted-foreground">Total added</p>
            <CurrencyDisplay amountInPaise={account.totalAddedInPaise || 0} />
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-3">
            <p className="text-xs text-muted-foreground">Total spent</p>
            <CurrencyDisplay amountInPaise={account.totalSpentInPaise || 0} />
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        {canExpense && !isSavings ? (
          <Button className="min-h-11 flex-1" onClick={() => setExpenseOpen(true)}>
            <Plus className="size-4" />
            Add expense
          </Button>
        ) : null}
        {isSavings ? (
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            onClick={() => setExpenseOpen(true)}
          >
            <Plus className="size-4" />
            Record deduction
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="min-h-11 flex-1"
          onClick={() => setAdjustOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Adjust balance
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Recent transactions</h2>
        {accountTransactions.length === 0 ? (
          <EmptyState
            icon="activity"
            title="No transactions"
            description="Nothing here yet."
          />
        ) : (
          <TransactionList
            transactions={accountTransactions}
            accountsById={accountsById}
            showBalanceAfter
          />
        )}
      </section>

      <ExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        initialAccountId={account.id}
      />

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="flex max-h-[min(92vh,720px)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-lg">
          <DialogHeader className="px-4 pt-5 sm:px-5">
            <DialogTitle className="font-heading text-xl font-extrabold text-foreground">
              Adjust balance
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
            <BalanceAdjustmentForm
              account={account}
              onCancel={() => setAdjustOpen(false)}
              onDone={() => setAdjustOpen(false)}
              embedded
            />
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
