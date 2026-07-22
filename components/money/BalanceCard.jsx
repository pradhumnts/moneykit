"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Eye, Receipt } from "lucide-react";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { AccountAvatar } from "@/components/money/AccountIcon";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BalanceCard({ account, onAddExpense }) {
  if (!account) return null;

  return (
    <section className="animate-page-enter overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AccountAvatar
            accountId={account.id}
            className="size-7"
            iconClassName="size-3.5"
          />
          <span className="truncate">{account.name}</span>
          <Eye className="size-4 shrink-0 opacity-60" aria-hidden />
        </div>
        <CurrencyDisplay
          amountInPaise={account.balanceInPaise}
          size="xl"
          className="font-extrabold tracking-tight text-foreground"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Link
          href="/add-money"
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-h-12 justify-center gap-2"
          )}
        >
          <ArrowUpRight className="size-4" aria-hidden />
          Add Money
        </Link>
        <Button
          type="button"
          variant="lime"
          className="min-h-12 justify-center gap-2"
          onClick={onAddExpense}
        >
          <Receipt className="size-4" aria-hidden />
          Add Expense
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[1.25rem] bg-muted/70 px-3.5 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border">
              <ArrowDownLeft className="size-3.5" aria-hidden />
            </span>
            Money added
          </div>
          <CurrencyDisplay
            amountInPaise={account.totalAddedInPaise || 0}
            className="text-base font-bold text-foreground"
          />
        </div>
        <div className="rounded-[1.25rem] bg-muted/70 px-3.5 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-white text-foreground ring-1 ring-border">
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
            Spending
          </div>
          <CurrencyDisplay
            amountInPaise={account.totalSpentInPaise || 0}
            className="text-base font-bold text-foreground"
          />
        </div>
      </div>
    </section>
  );
}
