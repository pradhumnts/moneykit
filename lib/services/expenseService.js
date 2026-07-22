import { validateExpense } from "@/lib/domain/validateExpense";

export function previewExpense({
  amountInPaise,
  account,
  expenseCategoryId,
  transactionDate,
}) {
  const validation = validateExpense({
    amountInPaise,
    accountBalanceInPaise: account?.balanceInPaise ?? 0,
    accountId: account?.id,
    expenseCategoryId,
    transactionDate,
  });

  if (!validation.isValid) {
    return { ok: false, validation, balanceAfterInPaise: null };
  }

  return {
    ok: true,
    validation,
    balanceBeforeInPaise: account.balanceInPaise,
    balanceAfterInPaise: account.balanceInPaise - validation.amountInPaise,
  };
}

export async function confirmExpense(repository, payload) {
  return repository.createExpense(payload);
}
