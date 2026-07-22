import { ACCOUNT_IDS } from "@/constants/allocationRules";
import { ALLOCATION_RULES } from "@/constants/allocationRules";
import { calculateAllocation } from "@/lib/domain/calculateAllocation";
import { roundPaise } from "@/lib/domain/money";
import {
  createAllocationItem,
  createAllocationRecord,
  createTransaction,
} from "@/lib/domain/transactionFactory";
import { validateBalanceAdjustment, validateExpense } from "@/lib/domain/validateExpense";
import { cloneState, createDefaultState } from "@/lib/storage/defaultData";
import {
  backupRawStorage,
  isLocalStorageAvailable,
  readRawStorage,
  removeRawStorage,
  writeRawStorage,
} from "@/lib/storage/localStorageClient";
import { migrateState } from "@/lib/storage/migrations";
import { validateRootState } from "@/lib/storage/validators";
import { getTodayDateString } from "@/lib/utils/dates";

function sortTransactions(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.transactionDate !== b.transactionDate) {
      return a.transactionDate < b.transactionDate ? 1 : -1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

function updateAccountBalance(account, nextBalanceInPaise, now) {
  return {
    ...account,
    balanceInPaise: roundPaise(nextBalanceInPaise),
    updatedAt: now,
  };
}

export function createLocalStorageFinanceRepository() {
  let memoryState = null;
  let recoveryMessage = null;

  async function loadState({ force = false } = {}) {
    if (memoryState && !force) {
      return cloneState(memoryState);
    }

    if (!isLocalStorageAvailable()) {
      memoryState = createDefaultState();
      recoveryMessage =
        "Local storage is unavailable, so changes will only last for this session.";
      return cloneState(memoryState);
    }

    const raw = readRawStorage();
    if (!raw) {
      memoryState = createDefaultState();
      writeRawStorage(JSON.stringify(memoryState));
      recoveryMessage = null;
      return cloneState(memoryState);
    }

    try {
      const parsed = JSON.parse(raw);
      const validation = validateRootState(parsed);
      if (!validation.valid) {
        throw new Error(validation.reason || "Invalid stored data.");
      }
      const { state } = migrateState(parsed);
      memoryState = state;
      writeRawStorage(JSON.stringify(memoryState));
      recoveryMessage = null;
      return cloneState(memoryState);
    } catch (error) {
      backupRawStorage(raw);
      memoryState = createDefaultState();
      writeRawStorage(JSON.stringify(memoryState));
      recoveryMessage =
        "We recovered from invalid local data and started fresh. Your previous data was backed up locally.";
      return cloneState(memoryState);
    }
  }

  async function persist(nextState) {
    const now = new Date().toISOString();
    const state = {
      ...nextState,
      metadata: {
        ...nextState.metadata,
        updatedAt: now,
      },
    };
    memoryState = state;
    if (isLocalStorageAvailable()) {
      writeRawStorage(JSON.stringify(state));
    }
    return cloneState(state);
  }

  return {
    async getRecoveryMessage() {
      await loadState();
      return recoveryMessage;
    },

    async clearRecoveryMessage() {
      recoveryMessage = null;
    },

    async getState() {
      return loadState();
    },

    async getHousehold() {
      const state = await loadState();
      return state.household;
    },

    async getMembers() {
      const state = await loadState();
      return state.members;
    },

    async getAccounts() {
      const state = await loadState();
      return [...state.accounts].sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async getAccountById(accountId) {
      const state = await loadState();
      return state.accounts.find((account) => account.id === accountId) || null;
    },

    async getTransactions(filters = {}) {
      const state = await loadState();
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

      return sortTransactions(items);
    },

    async getAllocations() {
      const state = await loadState();
      return [...state.allocations].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      );
    },

    async getExpenseCategories() {
      const state = await loadState();
      return [...state.expenseCategories]
        .filter((category) => category.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async createAllocation({
      amountInPaise,
      note = "",
      transactionDate,
      myDailyBalanceInPaise,
      wifeDailyBalanceInPaise,
    }) {
      const state = await loadState({ force: true });
      const now = new Date().toISOString();
      const date = transactionDate || getTodayDateString();

      const myDaily = state.accounts.find((a) => a.id === ACCOUNT_IDS.myDaily);
      const wifeDaily = state.accounts.find((a) => a.id === ACCOUNT_IDS.wifeDaily);

      const preview = calculateAllocation({
        amountInPaise,
        myDailyBalanceInPaise:
          myDailyBalanceInPaise ?? myDaily?.balanceInPaise ?? 0,
        wifeDailyBalanceInPaise:
          wifeDailyBalanceInPaise ?? wifeDaily?.balanceInPaise ?? 0,
        myDailyCapInPaise:
          state.settings.myDailyCapInPaise ?? ALLOCATION_RULES.myDailyCapInPaise,
        wifeDailyCapInPaise:
          state.settings.wifeDailyCapInPaise ?? ALLOCATION_RULES.wifeDailyCapInPaise,
      });

      if (preview.originalAmount <= 0) {
        throw new Error("Enter an amount greater than zero.");
      }
      if (preview.remainingDifference !== 0) {
        throw new Error("Allocation total did not match the entered amount.");
      }

      let accounts = [...state.accounts];
      const preAllocationTransactions = [];

      const syncDailyBalance = (accountId, nextBalance, label) => {
        if (nextBalance === undefined) return;
        const account = accounts.find((entry) => entry.id === accountId);
        if (!account || account.balanceInPaise === nextBalance) return;

        const previous = account.balanceInPaise;
        const difference = nextBalance - previous;
        preAllocationTransactions.push(
          createTransaction({
            accountId,
            amountInPaise: Math.abs(difference),
            direction: difference >= 0 ? "credit" : "debit",
            transactionType: "balance-adjustment",
            title: `${label} balance updated before allocation`,
            note: note
              ? `Updated before allocation. ${note}`
              : "Updated before allocation",
            balanceBeforeInPaise: previous,
            balanceAfterInPaise: nextBalance,
            transactionDate: date,
            now,
          })
        );
        accounts = accounts.map((entry) =>
          entry.id === accountId
            ? updateAccountBalance(entry, nextBalance, now)
            : entry
        );
      };

      syncDailyBalance(
        ACCOUNT_IDS.myDaily,
        myDailyBalanceInPaise,
        "My Daily Expense"
      );
      syncDailyBalance(
        ACCOUNT_IDS.wifeDaily,
        wifeDailyBalanceInPaise,
        "Wife's Daily Expense"
      );

      const allocation = createAllocationRecord({
        originalAmountInPaise: preview.originalAmount,
        note,
        transactionDate: date,
        now,
      });

      const itemDefs = [
        {
          accountId: ACCOUNT_IDS.myDaily,
          amount: preview.myDailyTopUp,
          type: "cap-top-up",
          basisPoints: null,
          title: "My Daily Expense top-up",
        },
        {
          accountId: ACCOUNT_IDS.wifeDaily,
          amount: preview.wifeDailyTopUp,
          type: "cap-top-up",
          basisPoints: null,
          title: "Wife's Daily Expense top-up",
        },
        {
          accountId: ACCOUNT_IDS.family,
          amount: preview.family,
          type: "percentage",
          basisPoints: ALLOCATION_RULES.familyBasisPoints,
          title: "Family Expense allocation",
        },
        {
          accountId: ACCOUNT_IDS.bigSavings,
          amount: preview.bigSavings,
          type: "remainder-split",
          basisPoints: ALLOCATION_RULES.savingsSplitBasisPoints,
          title: "Big Savings allocation",
        },
        {
          accountId: ACCOUNT_IDS.futureExpenses,
          amount: preview.futureExpenses,
          type: "remainder-split",
          basisPoints: ALLOCATION_RULES.savingsSplitBasisPoints,
          title: "Future Big Expenses allocation",
        },
      ];

      const allocationItems = [];
      const transactions = [...preAllocationTransactions];

      for (const item of itemDefs) {
        if (item.amount <= 0) continue;

        allocationItems.push(
          createAllocationItem({
            allocationId: allocation.id,
            accountId: item.accountId,
            amountInPaise: item.amount,
            allocationType: item.type,
            percentageBasisPoints: item.basisPoints,
            now,
          })
        );

        const account = accounts.find((entry) => entry.id === item.accountId);
        if (!account) continue;

        const balanceBefore = account.balanceInPaise;
        const balanceAfter = balanceBefore + item.amount;

        transactions.push(
          createTransaction({
            accountId: item.accountId,
            amountInPaise: item.amount,
            direction: "credit",
            transactionType: "income-allocation",
            title: item.title,
            note,
            allocationId: allocation.id,
            balanceBeforeInPaise: balanceBefore,
            balanceAfterInPaise: balanceAfter,
            transactionDate: date,
            now,
          })
        );

        accounts = accounts.map((entry) =>
          entry.id === item.accountId
            ? {
                ...updateAccountBalance(entry, balanceAfter, now),
                totalAddedInPaise: roundPaise(
                  (entry.totalAddedInPaise || 0) + item.amount
                ),
              }
            : entry
        );
      }

      const nextState = {
        ...state,
        accounts,
        allocations: [allocation, ...state.allocations],
        allocationItems: [...allocationItems, ...state.allocationItems],
        transactions: [...transactions, ...state.transactions],
      };

      return persist(nextState);
    },

    async createExpense({
      amountInPaise,
      accountId,
      expenseCategoryId,
      note = "",
      title,
      transactionDate,
      memberId = null,
    }) {
      const state = await loadState({ force: true });
      const now = new Date().toISOString();
      const date = transactionDate || getTodayDateString();
      const account = state.accounts.find((entry) => entry.id === accountId);

      if (!account) {
        throw new Error("Account not found.");
      }

      const validation = validateExpense({
        amountInPaise,
        accountBalanceInPaise: account.balanceInPaise,
        accountId,
        expenseCategoryId,
        transactionDate: date,
      });

      if (!validation.isValid) {
        const error = new Error("Expense validation failed.");
        error.validation = validation;
        throw error;
      }

      const amount = validation.amountInPaise;
      const balanceBefore = account.balanceInPaise;
      const balanceAfter = balanceBefore - amount;

      if (balanceAfter < 0) {
        throw new Error("Expense would create a negative balance.");
      }

      const category = state.expenseCategories.find(
        (entry) => entry.id === expenseCategoryId
      );

      const transaction = createTransaction({
        accountId,
        amountInPaise: amount,
        direction: "debit",
        transactionType: "expense",
        title: title || category?.name || "Expense",
        note,
        expenseCategoryId,
        memberId,
        balanceBeforeInPaise: balanceBefore,
        balanceAfterInPaise: balanceAfter,
        transactionDate: date,
        now,
      });

      const accounts = state.accounts.map((entry) =>
        entry.id === accountId
          ? {
              ...updateAccountBalance(entry, balanceAfter, now),
              totalSpentInPaise: roundPaise(
                (entry.totalSpentInPaise || 0) + amount
              ),
            }
          : entry
      );

      return persist({
        ...state,
        accounts,
        transactions: [transaction, ...state.transactions],
      });
    },

    async createAdjustment({
      accountId,
      newBalanceInPaise,
      note,
      transactionDate,
      memberId = null,
    }) {
      const state = await loadState({ force: true });
      const now = new Date().toISOString();
      const date = transactionDate || getTodayDateString();
      const account = state.accounts.find((entry) => entry.id === accountId);

      if (!account) {
        throw new Error("Account not found.");
      }

      const validation = validateBalanceAdjustment({
        newBalanceInPaise,
        note,
      });

      if (!validation.isValid) {
        const error = new Error("Adjustment validation failed.");
        error.validation = validation;
        throw error;
      }

      const previousBalance = account.balanceInPaise;
      const nextBalance = validation.newBalanceInPaise;
      const difference = nextBalance - previousBalance;
      const direction = difference >= 0 ? "credit" : "debit";

      const transaction = createTransaction({
        accountId,
        amountInPaise: Math.abs(difference),
        direction,
        transactionType: "balance-adjustment",
        title: `Balance adjusted from ₹${(previousBalance / 100).toLocaleString("en-IN")} to ₹${(nextBalance / 100).toLocaleString("en-IN")}`,
        note,
        memberId,
        balanceBeforeInPaise: previousBalance,
        balanceAfterInPaise: nextBalance,
        transactionDate: date,
        now,
      });

      const accounts = state.accounts.map((entry) =>
        entry.id === accountId
          ? updateAccountBalance(entry, nextBalance, now)
          : entry
      );

      return persist({
        ...state,
        accounts,
        transactions: [transaction, ...state.transactions],
      });
    },

    async saveState(state) {
      return persist(state);
    },

    async updateSettings(partial) {
      const state = await loadState();
      return persist({
        ...state,
        settings: {
          ...state.settings,
          ...partial,
        },
      });
    },

    async resetState() {
      memoryState = createDefaultState();
      if (isLocalStorageAvailable()) {
        removeRawStorage();
        writeRawStorage(JSON.stringify(memoryState));
      }
      recoveryMessage = null;
      return cloneState(memoryState);
    },
  };
}

export const localStorageFinanceRepository =
  createLocalStorageFinanceRepository();
