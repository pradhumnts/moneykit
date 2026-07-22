import { calculateAllocation } from "@/lib/domain/calculateAllocation";
import { validateIncomeAmount } from "@/lib/domain/validateExpense";
import { ALLOCATION_RULES } from "@/constants/allocationRules";

export function previewAllocation(input, settings = {}) {
  const amountCheck = validateIncomeAmount(input.amountInPaise);
  if (!amountCheck.isValid) {
    return {
      ok: false,
      error: amountCheck.error,
      preview: null,
    };
  }

  const preview = calculateAllocation({
    amountInPaise: amountCheck.amountInPaise,
    myDailyBalanceInPaise: input.myDailyBalanceInPaise,
    wifeDailyBalanceInPaise: input.wifeDailyBalanceInPaise,
    myDailyCapInPaise:
      settings.myDailyCapInPaise ?? ALLOCATION_RULES.myDailyCapInPaise,
    wifeDailyCapInPaise:
      settings.wifeDailyCapInPaise ?? ALLOCATION_RULES.wifeDailyCapInPaise,
  });

  return { ok: true, error: null, preview };
}

export async function confirmAllocation(repository, payload) {
  return repository.createAllocation(payload);
}
