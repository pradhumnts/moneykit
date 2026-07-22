"use client";

import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { TransactionAvatar } from "@/components/money/AccountIcon";
import { formatDateInTimezone } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

export function TransactionItem({
  transaction,
  accountName,
  showBalanceAfter = false,
  compact = false,
}) {
  const isCredit = transaction.direction === "credit";

  return (
    <article className="flex items-center gap-3.5 py-3.5">
      <TransactionAvatar
        accountId={transaction.accountId}
        transactionType={transaction.transactionType}
        direction={transaction.direction}
        className="size-12"
        iconClassName="size-5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {transaction.title}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {accountName}
              {!compact ? (
                <>
                  {" · "}
                  {formatDateInTimezone(transaction.createdAt, "time")}
                </>
              ) : null}
            </p>
            {showBalanceAfter ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Balance{" "}
                <CurrencyDisplay
                  amountInPaise={transaction.balanceAfterInPaise}
                  size="sm"
                  className="inline text-xs font-semibold text-foreground"
                />
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <CurrencyDisplay
              amountInPaise={
                isCredit ? transaction.amountInPaise : -transaction.amountInPaise
              }
              showPlus={isCredit}
              signed={!isCredit}
              size="sm"
              className={cn(
                "text-[15px] font-bold",
                isCredit ? "text-income" : "text-foreground"
              )}
            />
            {isCredit ? (
              <p className="mt-0.5 text-[11px] font-medium text-income">Income</p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
