import {
  ACCOUNT_IDS,
  ACCOUNT_SLUGS,
  ALLOCATION_RULES,
  HOUSEHOLD_ID,
  MEMBER_ME_ID,
  MEMBER_WIFE_ID,
} from "./allocationRules";

export const ACCOUNT_META = {
  [ACCOUNT_IDS.myDaily]: {
    slug: ACCOUNT_SLUGS.myDaily,
    name: "My Daily Expense",
    accountType: "daily-expense",
    accent: "daily-mine",
    shortLabel: "Day-to-day spending",
    ownerMemberId: MEMBER_ME_ID,
    defaultCapInPaise: ALLOCATION_RULES.myDailyCapInPaise,
  },
  [ACCOUNT_IDS.wifeDaily]: {
    slug: ACCOUNT_SLUGS.wifeDaily,
    name: "Wife's Daily Expense",
    accountType: "daily-expense",
    accent: "daily-wife",
    shortLabel: "Day-to-day spending",
    ownerMemberId: MEMBER_WIFE_ID,
    defaultCapInPaise: ALLOCATION_RULES.wifeDailyCapInPaise,
  },
  [ACCOUNT_IDS.family]: {
    slug: ACCOUNT_SLUGS.family,
    name: "Family Expense",
    accountType: "family-expense",
    accent: "family",
    shortLabel: "Shared household",
  },
  [ACCOUNT_IDS.bigSavings]: {
    slug: ACCOUNT_SLUGS.bigSavings,
    name: "Big Savings",
    accountType: "savings",
    accent: "savings",
    shortLabel: "Long-term savings",
  },
  [ACCOUNT_IDS.futureExpenses]: {
    slug: ACCOUNT_SLUGS.futureExpenses,
    name: "Future Big Expenses",
    accountType: "future-expense",
    accent: "future",
    shortLabel: "Upcoming large costs",
  },
};

export const PRIMARY_EXPENSE_ACCOUNT_IDS = [
  ACCOUNT_IDS.myDaily,
  ACCOUNT_IDS.wifeDaily,
  ACCOUNT_IDS.family,
];

export const OTHER_EXPENSE_ACCOUNT_IDS = [
  ACCOUNT_IDS.bigSavings,
  ACCOUNT_IDS.futureExpenses,
];

export const OVERVIEW_ACCOUNT_IDS = [
  ACCOUNT_IDS.family,
  ACCOUNT_IDS.bigSavings,
  ACCOUNT_IDS.futureExpenses,
];

export function getAccountMetaBySlug(slug) {
  return Object.values(ACCOUNT_META).find((meta) => meta.slug === slug) ?? null;
}

export function resolveAccountId(accountOrSlug) {
  if (!accountOrSlug) return null;
  if (ACCOUNT_IDS[accountOrSlug]) return ACCOUNT_IDS[accountOrSlug];
  const byId = Object.values(ACCOUNT_IDS).find((id) => id === accountOrSlug);
  if (byId) return byId;
  const entry = Object.entries(ACCOUNT_META).find(
    ([, meta]) => meta.slug === accountOrSlug
  );
  return entry ? entry[0] : null;
}

export { HOUSEHOLD_ID, MEMBER_ME_ID, MEMBER_WIFE_ID, ACCOUNT_IDS, ACCOUNT_SLUGS };
