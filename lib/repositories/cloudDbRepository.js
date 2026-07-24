import { PIN_HEADER } from "@/lib/sync/constants";
import {
  createLocalStorageFinanceRepository,
  localStorageFinanceRepository,
} from "@/lib/repositories/localStorageFinanceRepository";
import { isStateEmpty } from "@/lib/sync/stateHelpers";

async function api(path, { method = "GET", pin, body } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      [PIN_HEADER]: pin,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    error.validation = data.validation;
    throw error;
  }
  return data;
}

export function createCloudDbRepository(pin) {
  const cache = createLocalStorageFinanceRepository();
  let readyPromise = null;
  let lastSyncError = null;
  let lastSyncedAt = null;

  async function cacheState(state) {
    if (!state) return state;
    await cache.saveState(state);
    return state;
  }

  async function bootstrap() {
    try {
      const { state } = await api("/api/household", { pin });
      lastSyncError = null;

      const local = await localStorageFinanceRepository.getState();
      if (isStateEmpty(state) && !isStateEmpty(local)) {
        const bootstrapped = await api("/api/household", {
          method: "POST",
          pin,
          body: { state: local },
        });
        lastSyncedAt = new Date().toISOString();
        return cacheState(bootstrapped.state);
      }

      lastSyncedAt = new Date().toISOString();
      return cacheState(state);
    } catch (error) {
      lastSyncError = error?.message || "Could not load cloud data.";
      return localStorageFinanceRepository.getState();
    }
  }

  async function ensureReady() {
    if (!readyPromise) {
      readyPromise = bootstrap().catch((error) => {
        readyPromise = null;
        throw error;
      });
    }
    return readyPromise;
  }

  async function mutate(path, body, method = "POST") {
    await ensureReady();
    try {
      const data = await api(path, { method, pin, body });
      lastSyncError = null;
      lastSyncedAt = new Date().toISOString();
      return cacheState(data.state);
    } catch (error) {
      lastSyncError = error?.message || "Could not save to cloud.";
      throw error;
    }
  }

  return {
    async getState() {
      return ensureReady();
    },

    async getRecoveryMessage() {
      return cache.getRecoveryMessage();
    },

    async clearRecoveryMessage() {
      return cache.clearRecoveryMessage();
    },

    async getHousehold() {
      const state = await ensureReady();
      return state.household;
    },

    async getMembers() {
      const state = await ensureReady();
      return state.members;
    },

    async getAccounts() {
      const state = await ensureReady();
      return [...state.accounts].sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async getAccountById(accountId) {
      const state = await ensureReady();
      return state.accounts.find((account) => account.id === accountId) || null;
    },

    async getTransactions(filters = {}) {
      const state = await ensureReady();
      let items = state.transactions.filter((tx) => !tx.deletedAt);
      if (filters.accountId) {
        items = items.filter((tx) => tx.accountId === filters.accountId);
      }
      if (filters.transactionType) {
        items = items.filter((tx) => tx.transactionType === filters.transactionType);
      }
      if (filters.types?.length) {
        items = items.filter((tx) => filters.types.includes(tx.transactionType));
      }
      return items;
    },

    async getAllocations() {
      const state = await ensureReady();
      return state.allocations;
    },

    async getExpenseCategories() {
      const state = await ensureReady();
      return state.expenseCategories.filter((category) => category.isActive);
    },

    async createAllocation(payload) {
      return mutate("/api/household/allocation", payload);
    },

    async createExpense(payload) {
      return mutate("/api/household/expense", payload);
    },

    async createAdjustment(payload) {
      return mutate("/api/household/adjustment", payload);
    },

    async updateSettings(partial) {
      return mutate("/api/household/settings", partial, "PATCH");
    },

    async saveState(state) {
      return mutate("/api/household", { state });
    },

    async resetState() {
      return mutate("/api/household/reset", {});
    },

    async getLastSyncError() {
      return lastSyncError;
    },

    async getLastSyncedAt() {
      return lastSyncedAt;
    },

    async refreshFromCloud() {
      readyPromise = null;
      return ensureReady();
    },
  };
}
