import { createLocalStorageFinanceRepository } from "@/lib/repositories/localStorageFinanceRepository";
import { fetchCloudState, pushCloudState } from "@/lib/sync/syncClient";
import { getStateUpdatedAt, isStateEmpty } from "@/lib/sync/stateHelpers";

const MUTATING_METHODS = new Set([
  "createAllocation",
  "createExpense",
  "createAdjustment",
  "saveState",
  "updateSettings",
  "resetState",
]);

function pickNewerState(localState, cloudState, cloudUpdatedAt) {
  const localAt = getStateUpdatedAt(localState);
  const cloudAt = cloudUpdatedAt || getStateUpdatedAt(cloudState);

  if (cloudAt > localAt) return cloudState;
  return localState;
}

export function createCloudSyncRepository(pin) {
  const local = createLocalStorageFinanceRepository();
  let initialSyncPromise = null;
  let lastSyncError = null;
  let lastSyncedAt = null;

  async function performInitialSync() {
    const localState = await local.getState();
    let cloudPayload;

    try {
      cloudPayload = await fetchCloudState(pin);
      lastSyncError = null;
    } catch (error) {
      lastSyncError = error?.message || "Could not sync with cloud.";
      return localState;
    }

    const cloudState = cloudPayload?.state;
    const localEmpty = isStateEmpty(localState);
    const cloudEmpty = isStateEmpty(cloudState);

    if (cloudEmpty && localEmpty) {
      lastSyncedAt = new Date().toISOString();
      return localState;
    }

    if (cloudEmpty && !localEmpty) {
      try {
        await pushCloudState(pin, localState);
        lastSyncError = null;
        lastSyncedAt = new Date().toISOString();
      } catch (error) {
        lastSyncError = error?.message || "Could not upload local data.";
      }
      return localState;
    }

    if (!cloudEmpty && localEmpty) {
      const saved = await local.saveState(cloudState);
      lastSyncedAt = new Date().toISOString();
      return saved;
    }

    const winner = pickNewerState(localState, cloudState, cloudPayload.updatedAt);
    if (winner === cloudState) {
      const saved = await local.saveState(cloudState);
      lastSyncedAt = new Date().toISOString();
      return saved;
    }

    try {
      await pushCloudState(pin, localState);
      lastSyncError = null;
      lastSyncedAt = new Date().toISOString();
    } catch (error) {
      lastSyncError = error?.message || "Could not upload local data.";
    }

    return localState;
  }

  async function ensureInitialSync() {
    if (!initialSyncPromise) {
      initialSyncPromise = performInitialSync().catch((error) => {
        initialSyncPromise = null;
        throw error;
      });
    }
    return initialSyncPromise;
  }

  async function pushState(state) {
    try {
      await pushCloudState(pin, state);
      lastSyncError = null;
      lastSyncedAt = new Date().toISOString();
    } catch (error) {
      lastSyncError = error?.message || "Could not save to cloud.";
    }
  }

  async function runMutating(method, args) {
    await ensureInitialSync();
    const result = await local[method](...args);
    await pushState(result);
    return result;
  }

  const passthroughMethods = [
    "getRecoveryMessage",
    "clearRecoveryMessage",
    "getHousehold",
    "getMembers",
    "getAccounts",
    "getAccountById",
    "getTransactions",
    "getAllocations",
    "getExpenseCategories",
  ];

  const repository = {
    async getState() {
      await ensureInitialSync();
      return local.getState();
    },

    async getLastSyncError() {
      return lastSyncError;
    },

    async getLastSyncedAt() {
      return lastSyncedAt;
    },

    async refreshFromCloud() {
      initialSyncPromise = null;
      return ensureInitialSync().then(async () => local.getState());
    },
  };

  for (const method of passthroughMethods) {
    repository[method] = async (...args) => {
      await ensureInitialSync();
      return local[method](...args);
    };
  }

  for (const method of MUTATING_METHODS) {
    repository[method] = (...args) => runMutating(method, args);
  }

  return repository;
}
