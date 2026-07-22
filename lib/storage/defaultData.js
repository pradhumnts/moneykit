import {
  ACCOUNT_IDS,
  ALLOCATION_RULES,
  HOUSEHOLD_ID,
  MEMBER_ME_ID,
  MEMBER_WIFE_ID,
  SCHEMA_VERSION,
} from "@/constants/allocationRules";
import { ACCOUNT_META } from "@/constants/accounts";
import { createDefaultExpenseCategories } from "@/constants/expenseCategories";

export function createDefaultState(now = new Date().toISOString()) {
  const accounts = Object.entries(ACCOUNT_META).map(([id, meta], index) => ({
    id,
    householdId: HOUSEHOLD_ID,
    ownerMemberId: meta.ownerMemberId ?? null,
    slug: meta.slug,
    name: meta.name,
    accountType: meta.accountType,
    balanceInPaise: 0,
    capInPaise: meta.defaultCapInPaise ?? null,
    totalAddedInPaise: 0,
    totalSpentInPaise: 0,
    sortOrder: index + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  return {
    schemaVersion: SCHEMA_VERSION,
    household: {
      id: HOUSEHOLD_ID,
      name: "Our Household",
      currency: "INR",
      timezone: "Asia/Kolkata",
      createdAt: now,
      updatedAt: now,
    },
    members: [
      {
        id: MEMBER_ME_ID,
        householdId: HOUSEHOLD_ID,
        name: "Me",
        role: "owner",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: MEMBER_WIFE_ID,
        householdId: HOUSEHOLD_ID,
        name: "Wife",
        role: "member",
        createdAt: now,
        updatedAt: now,
      },
    ],
    accounts,
    transactions: [],
    allocations: [],
    allocationItems: [],
    expenseCategories: createDefaultExpenseCategories(now),
    settings: {
      currency: "INR",
      locale: "en-IN",
      timezone: "Asia/Kolkata",
      myDailyCapInPaise: ALLOCATION_RULES.myDailyCapInPaise,
      wifeDailyCapInPaise: ALLOCATION_RULES.wifeDailyCapInPaise,
      primaryAccountId: ACCOUNT_IDS.bigSavings,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      lastMigrationAt: null,
    },
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export { ACCOUNT_IDS };
