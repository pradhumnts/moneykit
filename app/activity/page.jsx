"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterChips } from "@/components/feedback/FilterChips";
import { TransactionList } from "@/components/money/TransactionList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";
import { useMoney } from "@/hooks/useMoney";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "income-allocation", label: "Money Added" },
  { value: "expense", label: "Expenses" },
  { value: "balance-adjustment", label: "Adjustments" },
];

export default function ActivityPage() {
  const { isLoading, transactions, accounts } = useMoney();
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");

  const accountsById = useMemo(() => {
    const map = {};
    for (const account of accounts) map[account.id] = account;
    return map;
  }, [accounts]);

  const accountFilterItems = useMemo(() => {
    const items = { all: "All Accounts" };
    for (const account of accounts) {
      items[account.id] = account.name;
    }
    return items;
  }, [accounts]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.transactionType !== typeFilter) {
        return false;
      }
      if (accountFilter !== "all" && tx.accountId !== accountFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, typeFilter, accountFilter]);

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Activity" />

      <div className="mb-5 space-y-3">
        <FilterChips
          options={TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <FormField label="Account" htmlFor="account-filter">
          <Select
            value={accountFilter}
            items={accountFilterItems}
            onValueChange={setAccountFilter}
          >
            <SelectTrigger id="account-filter" className="min-h-11 w-full rounded-2xl">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No activity yet"
          description="Add money or an expense."
          actionLabel="Add Money"
          actionHref="/add-money"
        />
      ) : (
        <TransactionList
          transactions={filtered}
          accountsById={accountsById}
          showAccountName={false}
        />
      )}
    </AppShell>
  );
}
