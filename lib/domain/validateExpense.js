import { roundPaise } from "@/lib/domain/money";

export function validateExpense({
  amountInPaise,
  accountBalanceInPaise,
  accountId,
  expenseCategoryId,
  transactionDate,
}) {
  const errors = {};
  const amount = roundPaise(amountInPaise);
  const balance = roundPaise(accountBalanceInPaise);

  if (!accountId) {
    errors.accountId = "Choose where this was paid from.";
  }

  if (!expenseCategoryId) {
    errors.expenseCategoryId = "Choose an expense category.";
  }

  if (!transactionDate) {
    errors.transactionDate = "Choose a date.";
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  } else if (amount > balance) {
    errors.amount = "insufficient";
    errors.availableInPaise = balance;
  }

  return {
    isValid: Object.keys(errors).filter((key) => key !== "availableInPaise").length === 0,
    errors,
    amountInPaise: amount,
  };
}

export function validateIncomeAmount(amountInPaise) {
  const amount = roundPaise(amountInPaise);
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      isValid: false,
      error: "Enter an amount greater than zero.",
      amountInPaise: 0,
    };
  }
  return { isValid: true, error: null, amountInPaise: amount };
}

export function validateBalanceAdjustment({ newBalanceInPaise, note }) {
  const errors = {};
  const newBalance = roundPaise(newBalanceInPaise);

  if (!Number.isFinite(newBalance) || newBalance < 0) {
    errors.newBalance = "Enter a valid balance of zero or more.";
  }

  if (!note || !String(note).trim()) {
    errors.note = "Add a short reason for this adjustment.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    newBalanceInPaise: Math.max(0, newBalance || 0),
  };
}
