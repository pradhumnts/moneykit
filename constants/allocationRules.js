/** Fixed allocation rules for this version. */

export const ALLOCATION_RULES = {
  familyBasisPoints: 2000, // 20% of gross
  savingsSplitBasisPoints: 5000, // 50% of remainder each
  myDailyCapInPaise: 4_000_000, // ₹40,000
  wifeDailyCapInPaise: 1_000_000, // ₹10,000
};

export const ALLOCATION_PRIORITY = [
  "myDaily",
  "wifeDaily",
  "family",
  "bigSavings",
  "futureExpenses",
];

export const STORAGE_KEY = "moneykit-data";
export const STORAGE_BACKUP_KEY = "moneykit-data-backup";
export const LEGACY_STORAGE_KEY = "personal-money-manager-data";
export const LEGACY_STORAGE_BACKUP_KEY = "personal-money-manager-data-backup";
export const SCHEMA_VERSION = 1;

export const HOUSEHOLD_ID = "household_default";
export const MEMBER_ME_ID = "member_me";
export const MEMBER_WIFE_ID = "member_wife";

export const ACCOUNT_IDS = {
  dharma: "account_dharma",
  dharmaSocial: "account_dharma_social",
  myDaily: "account_my_daily",
  wifeDaily: "account_wife_daily",
  family: "account_family",
  bigSavings: "account_big_savings",
  futureExpenses: "account_future_expenses",
};

/** Legacy accounts kept for old activity records only. */
export const RETIRED_ACCOUNT_IDS = [
  ACCOUNT_IDS.dharma,
  ACCOUNT_IDS.dharmaSocial,
];

export const ACCOUNT_SLUGS = {
  dharma: "dharma",
  dharmaSocial: "dharma-social",
  myDaily: "my-daily",
  wifeDaily: "wife-daily",
  family: "family",
  bigSavings: "big-savings",
  futureExpenses: "future-expenses",
};
