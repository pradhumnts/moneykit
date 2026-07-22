import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { ALLOCATION_RULES } from "@/constants/allocationRules";
import {
  amountNeededToCap,
  applyPercentageInPaise,
  dividePaise,
  roundPaise,
} from "@/lib/domain/money";

/**
 * Pure allocation calculator. Works only with integer paise.
 */
export function calculateAllocation({
  amountInPaise,
  myDailyBalanceInPaise = 0,
  wifeDailyBalanceInPaise = 0,
  myDailyCapInPaise = ALLOCATION_RULES.myDailyCapInPaise,
  wifeDailyCapInPaise = ALLOCATION_RULES.wifeDailyCapInPaise,
} = {}) {
  const originalAmount = roundPaise(amountInPaise);

  if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
    return buildResult({
      originalAmount: Math.max(0, originalAmount || 0),
      allocations: emptyAllocations(),
      desired: emptyAllocations(),
      hasInsufficientFunds: originalAmount > 0,
      warnings: originalAmount <= 0 ? ["Enter an amount greater than zero."] : [],
    });
  }

  const desired = {
    myDaily: amountNeededToCap(myDailyBalanceInPaise, myDailyCapInPaise),
    wifeDaily: amountNeededToCap(wifeDailyBalanceInPaise, wifeDailyCapInPaise),
    family: applyPercentageInPaise(
      originalAmount,
      ALLOCATION_RULES.familyBasisPoints
    ),
    bigSavings: 0,
    futureExpenses: 0,
  };

  const fixedDesiredTotal =
    desired.myDaily + desired.wifeDaily + desired.family;

  const remainingForSavings = Math.max(0, originalAmount - fixedDesiredTotal);
  const [desiredBigSavings, desiredFuture] = dividePaise(remainingForSavings, 2);
  desired.bigSavings = desiredBigSavings;
  desired.futureExpenses = desiredFuture;

  const allocations = emptyAllocations();
  let available = originalAmount;
  const warnings = [];

  const take = (key, desiredAmount, label) => {
    const amount = Math.min(desiredAmount, available);
    allocations[key] = amount;
    available -= amount;
    if (amount < desiredAmount) {
      warnings.push({
        key,
        label,
        desired: desiredAmount,
        actual: amount,
        shortfall: desiredAmount - amount,
      });
    }
  };

  take("myDaily", desired.myDaily, "My Daily Expense");
  take("wifeDaily", desired.wifeDaily, "Wife's Daily Expense");
  take("family", desired.family, "Family Expense");

  const leftover = available;
  const [bigSavings, futureExpenses] = dividePaise(leftover, 2);
  allocations.bigSavings = bigSavings;
  allocations.futureExpenses = futureExpenses;
  available = 0;

  if (bigSavings < desired.bigSavings) {
    warnings.push({
      key: "bigSavings",
      label: "Big Savings",
      desired: desired.bigSavings,
      actual: bigSavings,
      shortfall: desired.bigSavings - bigSavings,
    });
  }
  if (futureExpenses < desired.futureExpenses) {
    warnings.push({
      key: "futureExpenses",
      label: "Future Big Expenses",
      desired: desired.futureExpenses,
      actual: futureExpenses,
      shortfall: desired.futureExpenses - futureExpenses,
    });
  }

  return buildResult({
    originalAmount,
    allocations,
    desired,
    hasInsufficientFunds: warnings.length > 0,
    warnings,
    myDailyCapInPaise,
    wifeDailyCapInPaise,
    myDailyBalanceInPaise: roundPaise(myDailyBalanceInPaise),
    wifeDailyBalanceInPaise: roundPaise(wifeDailyBalanceInPaise),
  });
}

function emptyAllocations() {
  return {
    myDaily: 0,
    wifeDaily: 0,
    family: 0,
    bigSavings: 0,
    futureExpenses: 0,
  };
}

function buildResult({
  originalAmount,
  allocations,
  desired,
  hasInsufficientFunds,
  warnings,
  myDailyCapInPaise = ALLOCATION_RULES.myDailyCapInPaise,
  wifeDailyCapInPaise = ALLOCATION_RULES.wifeDailyCapInPaise,
  myDailyBalanceInPaise = 0,
  wifeDailyBalanceInPaise = 0,
}) {
  const totalDistributed =
    allocations.myDaily +
    allocations.wifeDaily +
    allocations.family +
    allocations.bigSavings +
    allocations.futureExpenses;

  return {
    originalAmount,
    myDailyTopUp: allocations.myDaily,
    wifeDailyTopUp: allocations.wifeDaily,
    family: allocations.family,
    bigSavings: allocations.bigSavings,
    futureExpenses: allocations.futureExpenses,
    breakdown: { ...allocations },
    desired: { ...desired },
    totalDistributed,
    remainingDifference: originalAmount - totalDistributed,
    hasInsufficientFunds,
    warnings,
    myDailyCapInPaise,
    wifeDailyCapInPaise,
    myDailyBalanceInPaise,
    wifeDailyBalanceInPaise,
    myDailyNewBalance: myDailyBalanceInPaise + allocations.myDaily,
    wifeDailyNewBalance: wifeDailyBalanceInPaise + allocations.wifeDaily,
    accountAmounts: {
      [ACCOUNT_IDS.myDaily]: allocations.myDaily,
      [ACCOUNT_IDS.wifeDaily]: allocations.wifeDaily,
      [ACCOUNT_IDS.family]: allocations.family,
      [ACCOUNT_IDS.bigSavings]: allocations.bigSavings,
      [ACCOUNT_IDS.futureExpenses]: allocations.futureExpenses,
    },
  };
}

/** Convenience wrapper using rupee inputs for tests/UI helpers. */
export function calculateAllocationFromRupees({
  amount,
  myDailyBalance,
  wifeDailyBalance,
}) {
  return calculateAllocation({
    amountInPaise: Math.round(Number(amount) * 100),
    myDailyBalanceInPaise: Math.round(Number(myDailyBalance) * 100),
    wifeDailyBalanceInPaise: Math.round(Number(wifeDailyBalance) * 100),
  });
}
