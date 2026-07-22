"use client";

import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { ACCOUNT_META } from "@/constants/accounts";
import { AllocationRow } from "@/components/money/AllocationRow";

const HISTORY_ROWS = [
  {
    accountId: ACCOUNT_IDS.myDaily,
    isTopUp: true,
  },
  {
    accountId: ACCOUNT_IDS.wifeDaily,
    isTopUp: true,
  },
  {
    accountId: ACCOUNT_IDS.family,
    isTopUp: false,
  },
  {
    accountId: ACCOUNT_IDS.bigSavings,
    isTopUp: false,
  },
  {
    accountId: ACCOUNT_IDS.futureExpenses,
    isTopUp: false,
  },
];

export function AllocationHistoryBreakdown({ items = [] }) {
  const amountsByAccountId = Object.fromEntries(
    items.map((item) => [item.accountId, item.amountInPaise])
  );

  return (
    <div className="space-y-3 stagger-children">
      {HISTORY_ROWS.map((row) => {
        const meta = ACCOUNT_META[row.accountId];
        const adding = amountsByAccountId[row.accountId] || 0;
        return (
          <AllocationRow
            key={row.accountId}
            accountId={row.accountId}
            label={meta?.name || row.accountId}
            shortLabel={meta?.shortLabel}
            addingInPaise={adding}
            isTopUp={row.isTopUp}
            capReached={row.isTopUp && adding === 0}
          />
        );
      })}
    </div>
  );
}
