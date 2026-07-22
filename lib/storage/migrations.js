import { SCHEMA_VERSION, RETIRED_ACCOUNT_IDS } from "@/constants/allocationRules";
import { createDefaultState } from "@/lib/storage/defaultData";

/**
 * Lightweight migration runner.
 * Version 1 is the initial normalized schema.
 */
const migrations = {
  // Placeholder for future schema upgrades:
  // 2: migrateToVersionTwo,
};

export function migrateState(rawState) {
  if (!rawState || typeof rawState !== "object") {
    return {
      state: createDefaultState(),
      migrated: true,
      fromVersion: null,
      toVersion: SCHEMA_VERSION,
    };
  }

  let state = { ...rawState };
  let version =
    typeof state.schemaVersion === "number" ? state.schemaVersion : 0;

  // Legacy / incomplete payloads get normalized into v1 defaults with best effort.
  if (version < 1) {
    state = migrateToVersionOne(state);
    version = 1;
  }

  while (version < SCHEMA_VERSION) {
    const nextVersion = version + 1;
    const migrate = migrations[nextVersion];
    if (!migrate) break;
    state = migrate(state);
    state.schemaVersion = nextVersion;
    version = nextVersion;
  }

  state.schemaVersion = SCHEMA_VERSION;
  state.metadata = {
    ...(state.metadata || {}),
    lastMigrationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (Array.isArray(state.accounts)) {
    state.accounts = state.accounts
      .filter((account) => !RETIRED_ACCOUNT_IDS.includes(account.id))
      .map((account, index) => ({
        ...account,
        sortOrder: index + 1,
      }));
  }

  return {
    state,
    migrated: true,
    fromVersion: typeof rawState.schemaVersion === "number" ? rawState.schemaVersion : 0,
    toVersion: SCHEMA_VERSION,
  };
}

function migrateToVersionOne(legacy) {
  const fresh = createDefaultState();

  // If somehow we already have a near-v1 shape, keep arrays that look valid.
  if (Array.isArray(legacy.accounts) && legacy.accounts.length > 0) {
    fresh.accounts = legacy.accounts;
  }
  if (Array.isArray(legacy.transactions)) {
    fresh.transactions = legacy.transactions;
  }
  if (Array.isArray(legacy.allocations)) {
    fresh.allocations = legacy.allocations;
  }
  if (Array.isArray(legacy.allocationItems)) {
    fresh.allocationItems = legacy.allocationItems;
  }
  if (Array.isArray(legacy.members) && legacy.members.length > 0) {
    fresh.members = legacy.members;
  }
  if (Array.isArray(legacy.expenseCategories) && legacy.expenseCategories.length > 0) {
    fresh.expenseCategories = legacy.expenseCategories;
  }
  if (legacy.household && typeof legacy.household === "object") {
    fresh.household = { ...fresh.household, ...legacy.household };
  }
  if (legacy.settings && typeof legacy.settings === "object") {
    fresh.settings = { ...fresh.settings, ...legacy.settings };
  }

  fresh.schemaVersion = 1;
  return fresh;
}

export { migrations };
