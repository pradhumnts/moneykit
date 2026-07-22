import { HOUSEHOLD_ID } from "@/constants/allocationRules";
import { createId } from "@/lib/utils/ids";
import { roundPaise } from "@/lib/domain/money";

export function createTransaction({
  accountId,
  amountInPaise,
  direction,
  transactionType,
  title,
  note = "",
  expenseCategoryId = null,
  allocationId = null,
  memberId = null,
  balanceBeforeInPaise,
  balanceAfterInPaise,
  transactionDate,
  householdId = HOUSEHOLD_ID,
  now = new Date().toISOString(),
}) {
  return {
    id: createId("transaction"),
    householdId,
    accountId,
    memberId,
    allocationId,
    transactionType,
    direction,
    amountInPaise: roundPaise(amountInPaise),
    balanceBeforeInPaise: roundPaise(balanceBeforeInPaise),
    balanceAfterInPaise: roundPaise(balanceAfterInPaise),
    expenseCategoryId,
    title,
    note: note || "",
    transactionDate,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: "local",
  };
}

export function createAllocationRecord({
  originalAmountInPaise,
  note = "",
  transactionDate,
  householdId = HOUSEHOLD_ID,
  now = new Date().toISOString(),
}) {
  return {
    id: createId("allocation"),
    householdId,
    originalAmountInPaise: roundPaise(originalAmountInPaise),
    note: note || "",
    transactionDate,
    createdAt: now,
    updatedAt: now,
    syncStatus: "local",
  };
}

export function createAllocationItem({
  allocationId,
  accountId,
  amountInPaise,
  allocationType,
  percentageBasisPoints = null,
  now = new Date().toISOString(),
}) {
  return {
    id: createId("allocation_item"),
    allocationId,
    accountId,
    amountInPaise: roundPaise(amountInPaise),
    allocationType,
    percentageBasisPoints,
    createdAt: now,
  };
}
