"use client";

import Link from "next/link";
import { CurrencyDisplay } from "@/components/money/CurrencyDisplay";
import { ProgressBar } from "@/components/money/ProgressBar";
import { AccountAvatar } from "@/components/money/AccountIcon";
import { amountNeededToCap, percentOfCap } from "@/lib/domain/money";
import { formatPaiseAsINR } from "@/lib/utils/currency";

function getProgressIndicator(balanceInPaise, capInPaise) {
  const percent = percentOfCap(balanceInPaise, capInPaise);
  const needed = amountNeededToCap(balanceInPaise, capInPaise);

  if (needed === 0 || percent >= 60) return "bg-primary";
  if (percent >= 25) return "bg-[#e0a106]";
  return "bg-[#c2410c]";
}

export function DailyExpenseCard({ account }) {
  const percent = percentOfCap(account.balanceInPaise, account.capInPaise);
  const needed = amountNeededToCap(account.balanceInPaise, account.capInPaise);
  const indicator = getProgressIndicator(
    account.balanceInPaise,
    account.capInPaise
  );

  return (
    <article className="rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-start gap-3">
        <AccountAvatar accountId={account.id} className="size-11" iconClassName="size-5" />
        <div>
          <h3 className="text-sm font-bold text-foreground">{account.name}</h3>
          <p className="text-xs text-muted-foreground">
            Cap {formatPaiseAsINR(account.capInPaise)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <CurrencyDisplay
          amountInPaise={account.balanceInPaise}
          size="lg"
          className="font-extrabold text-foreground"
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{percent}% filled</span>
          <span>
            {needed === 0 ? "Cap reached" : `${formatPaiseAsINR(needed)} to cap`}
          </span>
        </div>
        <ProgressBar
          value={percent}
          trackClassName="h-2.5 bg-muted"
          indicatorClassName={indicator}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/accounts/${account.id}`}
          className="text-sm font-medium text-muted-foreground"
        >
          Details →
        </Link>
      </div>
    </article>
  );
}
