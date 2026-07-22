"use client";

import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { ACCOUNT_META } from "@/constants/accounts";
import { AllocationRow } from "@/components/money/AllocationRow";
import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/InlineAlert";
import { formatPaiseAsINR } from "@/lib/utils/currency";

const ROWS = [
  {
    key: "myDaily",
    accountId: ACCOUNT_IDS.myDaily,
    label: "My Daily Expense",
    isTopUp: true,
  },
  {
    key: "wifeDaily",
    accountId: ACCOUNT_IDS.wifeDaily,
    label: "Wife's Daily Expense",
    isTopUp: true,
  },
  { key: "family", accountId: ACCOUNT_IDS.family, label: "Family Expense" },
  { key: "bigSavings", accountId: ACCOUNT_IDS.bigSavings, label: "Big Savings" },
  {
    key: "futureExpenses",
    accountId: ACCOUNT_IDS.futureExpenses,
    label: "Future Big Expenses",
  },
];

export function AllocationPreview({
  preview,
  accountsById,
  editedDailyBalances,
}) {
  if (!preview) return null;

  const myDailyBalance =
    editedDailyBalances?.myDaily ??
    accountsById[ACCOUNT_IDS.myDaily]?.balanceInPaise ??
    0;
  const wifeDailyBalance =
    editedDailyBalances?.wifeDaily ??
    accountsById[ACCOUNT_IDS.wifeDaily]?.balanceInPaise ??
    0;

  const currentBalances = {
    myDaily: myDailyBalance,
    wifeDaily: wifeDailyBalance,
    family: accountsById[ACCOUNT_IDS.family]?.balanceInPaise || 0,
    bigSavings: accountsById[ACCOUNT_IDS.bigSavings]?.balanceInPaise || 0,
    futureExpenses:
      accountsById[ACCOUNT_IDS.futureExpenses]?.balanceInPaise || 0,
  };

  return (
    <div className="space-y-4">
      {preview.hasInsufficientFunds ? (
        <Alert className="border-[oklch(0.9_0.05_75)] bg-[oklch(0.98_0.02_85)]">
          <AlertTitle>Not enough for full split</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1">
              {preview.warnings
                .filter((warning) => typeof warning === "object")
                .map((warning) => (
                  <li key={warning.key}>
                    {warning.label}: {formatPaiseAsINR(warning.actual)} of{" "}
                    {formatPaiseAsINR(warning.desired)}
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3 stagger-children">
        {ROWS.map((row) => {
          const adding = preview.breakdown[row.key] || 0;
          const current = currentBalances[row.key] || 0;
          const desired = preview.desired?.[row.key] ?? adding;
          const meta = ACCOUNT_META[row.accountId];
          return (
            <AllocationRow
              key={row.key}
              accountId={row.accountId}
              label={row.label}
              shortLabel={meta?.shortLabel}
              currentInPaise={current}
              addingInPaise={adding}
              newBalanceInPaise={current + adding}
              isTopUp={row.isTopUp}
              capReached={
                row.isTopUp &&
                adding === 0 &&
                current >=
                  (row.key === "myDaily"
                    ? preview.myDailyCapInPaise
                    : preview.wifeDailyCapInPaise)
              }
              reduced={adding < desired}
              desiredInPaise={desired}
            />
          );
        })}
      </div>
    </div>
  );
}
