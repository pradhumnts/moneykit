"use client";

import { TransactionItem } from "@/components/money/TransactionItem";
import { getDateGroupLabel } from "@/lib/utils/dates";

export function TransactionList({
  transactions,
  accountsById,
  showBalanceAfter = false,
  showAccountName = true,
  emptyMessage = "No activity yet.",
}) {
  if (!transactions.length) {
    return (
      <p className="rounded-[1.5rem] border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  const groups = [];
  for (const tx of transactions) {
    const label = getDateGroupLabel(tx.transactionDate);
    const last = groups[groups.length - 1];
    if (!last || last.label !== label) {
      groups.push({ label, items: [tx] });
    } else {
      last.items.push(tx);
    }
  }

  return (
    <div className="space-y-6 stagger-children">
      {groups.map((group) => (
        <section key={group.label} className="space-y-1">
          <h3 className="px-0.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {group.label}
          </h3>
          <div className="rounded-[1.5rem] border border-border/80 bg-card px-4 shadow-soft">
            <div className="divide-y divide-border/70">
              {group.items.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  accountName={
                    accountsById[transaction.accountId]?.name || "Account"
                  }
                  showBalanceAfter={showBalanceAfter}
                  showAccountName={showAccountName}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
