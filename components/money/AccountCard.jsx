"use client";

import Link from "next/link";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { AccountAvatar } from "@/components/money/AccountIcon";
import { ACCOUNT_META } from "@/constants/accounts";

export function AccountCard({ account }) {
  const meta = ACCOUNT_META[account.id];

  return (
    <article className="flex h-full flex-col rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <AccountAvatar accountId={account.id} className="size-11" iconClassName="size-5" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">
            {account.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {meta?.shortLabel || "Account"}
          </p>
        </div>
      </div>

      <CurrencyDisplay
        amountInPaise={account.balanceInPaise}
        size="lg"
        className="mt-4 font-extrabold text-foreground"
      />

      <Link
        href={`/accounts/${account.id}`}
        className="mt-auto pt-4 text-sm font-semibold text-primary"
      >
        View activity →
      </Link>
    </article>
  );
}
