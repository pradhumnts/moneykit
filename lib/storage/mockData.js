/**
 * Optional mock data for local development.
 * Do not import this from the app runtime path — it never auto-loads.
 */
import { createDefaultState } from "@/lib/storage/defaultData";
import { ACCOUNT_IDS } from "@/constants/allocationRules";

export function createMockHouseholdState() {
  const state = createDefaultState();
  const now = new Date().toISOString();

  state.accounts = state.accounts.map((account) => {
    if (account.id === ACCOUNT_IDS.myDaily) {
      return {
        ...account,
        balanceInPaise: 3_100_000,
        totalAddedInPaise: 3_100_000,
        updatedAt: now,
      };
    }
    if (account.id === ACCOUNT_IDS.wifeDaily) {
      return {
        ...account,
        balanceInPaise: 800_000,
        totalAddedInPaise: 800_000,
        updatedAt: now,
      };
    }
    return account;
  });

  return state;
}
