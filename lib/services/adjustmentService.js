import { validateBalanceAdjustment } from "@/lib/domain/validateExpense";

export function previewAdjustment({ account, newBalanceInPaise, note }) {
  const validation = validateBalanceAdjustment({ newBalanceInPaise, note });
  if (!validation.isValid) {
    return { ok: false, validation, differenceInPaise: null };
  }

  return {
    ok: true,
    validation,
    previousBalanceInPaise: account.balanceInPaise,
    newBalanceInPaise: validation.newBalanceInPaise,
    differenceInPaise: validation.newBalanceInPaise - account.balanceInPaise,
  };
}

export async function confirmAdjustment(repository, payload) {
  return repository.createAdjustment(payload);
}
