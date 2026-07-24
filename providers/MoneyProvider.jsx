"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ACCOUNT_IDS, RETIRED_ACCOUNT_IDS } from "@/constants/allocationRules";
import { localStorageFinanceRepository } from "@/lib/repositories/localStorageFinanceRepository";
import { confirmAllocation, previewAllocation } from "@/lib/services/allocationService";
import { confirmExpense, previewExpense } from "@/lib/services/expenseService";
import { confirmAdjustment, previewAdjustment } from "@/lib/services/adjustmentService";
import { isSameMonth } from "@/lib/utils/dates";
import { toast } from "sonner";

const MoneyContext = createContext(null);

function applyState(setters, state) {
  setters.setHousehold(state.household);
  setters.setMembers(state.members);
  setters.setAccounts(state.accounts);
  setters.setTransactions(state.transactions.filter((tx) => !tx.deletedAt));
  setters.setAllocations(state.allocations);
  setters.setAllocationItems(state.allocationItems);
  setters.setExpenseCategories(state.expenseCategories);
  setters.setSettings(state.settings);
}

export function MoneyProvider({
  children,
  repository = localStorageFinanceRepository,
  syncEnabled = false,
  lockApp = null,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveryMessage, setRecoveryMessage] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [allocationItems, setAllocationItems] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncError, setLastSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const savingLock = useRef(false);

  const setters = useMemo(
    () => ({
      setHousehold,
      setMembers,
      setAccounts,
      setTransactions,
      setAllocations,
      setAllocationItems,
      setExpenseCategories,
      setSettings,
    }),
    []
  );

  const refreshSyncMeta = useCallback(async () => {
    if (repository.getLastSyncError) {
      setLastSyncError(await repository.getLastSyncError());
    }
    if (repository.getLastSyncedAt) {
      setLastSyncedAt(await repository.getLastSyncedAt());
    }
  }, [repository]);

  const refreshData = useCallback(async () => {
    const state = await repository.getState();
    applyState(setters, state);
    if (repository.getRecoveryMessage) {
      const message = await repository.getRecoveryMessage();
      setRecoveryMessage(message);
    }
    await refreshSyncMeta();
    return state;
  }, [repository, setters, refreshSyncMeta]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const state = await repository.getState();
        if (!active) return;
        applyState(setters, state);
        if (repository.getRecoveryMessage) {
          const message = await repository.getRecoveryMessage();
          if (active) setRecoveryMessage(message);
        }
        if (repository.getLastSyncError) {
          const syncError = await repository.getLastSyncError();
          if (active) {
            setLastSyncError(syncError);
            if (syncError) toast.warning(syncError);
          }
        }
        if (repository.getLastSyncedAt) {
          const syncedAt = await repository.getLastSyncedAt();
          if (active) setLastSyncedAt(syncedAt);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load your money data.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repository, setters]);

  useEffect(() => {
    if (!syncEnabled || !repository.refreshFromCloud) return undefined;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      repository
        .refreshFromCloud()
        .then((state) => {
          applyState(setters, state);
          return refreshSyncMeta();
        })
        .catch(() => {});
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [syncEnabled, repository, setters, refreshSyncMeta]);

  const getAccountById = useCallback(
    (accountId) => accounts.find((account) => account.id === accountId) || null,
    [accounts]
  );

  const getAccountBySlug = useCallback(
    (slug) => accounts.find((account) => account.slug === slug) || null,
    [accounts]
  );

  const totalBalanceInPaise = useMemo(
    () =>
      accounts
        .filter((account) => !RETIRED_ACCOUNT_IDS.includes(account.id))
        .reduce((sum, account) => sum + (account.balanceInPaise || 0), 0),
    [accounts]
  );

  const totalAddedInPaise = useMemo(
    () =>
      accounts
        .filter((account) => !RETIRED_ACCOUNT_IDS.includes(account.id))
        .reduce((sum, account) => sum + (account.totalAddedInPaise || 0), 0),
    [accounts]
  );

  const totalSpentInPaise = useMemo(
    () =>
      accounts
        .filter((account) => !RETIRED_ACCOUNT_IDS.includes(account.id))
        .reduce((sum, account) => sum + (account.totalSpentInPaise || 0), 0),
    [accounts]
  );

  const primaryAccountId =
    settings?.primaryAccountId ?? ACCOUNT_IDS.bigSavings;

  const primaryAccount = useMemo(() => {
    return (
      accounts.find((account) => account.id === primaryAccountId) ||
      accounts.find((account) => account.id === ACCOUNT_IDS.bigSavings) ||
      accounts[0] ||
      null
    );
  }, [accounts, primaryAccountId]);

  const getMonthlyExpenseStats = useCallback(
    (accountId) => {
      const monthTx = transactions.filter(
        (tx) =>
          tx.accountId === accountId &&
          tx.transactionType === "expense" &&
          isSameMonth(tx.transactionDate)
      );
      return {
        count: monthTx.length,
        spentInPaise: monthTx.reduce((sum, tx) => sum + tx.amountInPaise, 0),
      };
    },
    [transactions]
  );

  const notifySyncIssue = useCallback(async () => {
    if (!repository.getLastSyncError) return;
    const syncError = await repository.getLastSyncError();
    if (syncError) {
      toast.warning(syncError);
    }
  }, [repository]);

  const withSaveLock = useCallback(
    async (action) => {
      if (savingLock.current) {
        throw new Error("Another save is already in progress.");
      }
      savingLock.current = true;
      setIsSaving(true);
      try {
        const result = await action();
        await notifySyncIssue();
        return result;
      } finally {
        savingLock.current = false;
        setIsSaving(false);
      }
    },
    [notifySyncIssue]
  );

  const addAllocation = useCallback(
    async (payload) => {
      return withSaveLock(async () => {
        const state = await confirmAllocation(repository, payload);
        applyState(setters, state);
        toast.success("Money distributed");
        return state;
      });
    },
    [repository, setters, withSaveLock]
  );

  const addExpense = useCallback(
    async (payload) => {
      return withSaveLock(async () => {
        const state = await confirmExpense(repository, payload);
        applyState(setters, state);
        toast.success("Expense recorded");
        return state;
      });
    },
    [repository, setters, withSaveLock]
  );

  const adjustBalance = useCallback(
    async (payload) => {
      return withSaveLock(async () => {
        const state = await confirmAdjustment(repository, payload);
        applyState(setters, state);
        toast.success("Balance updated");
        return state;
      });
    },
    [repository, setters, withSaveLock]
  );

  const resetLocalData = useCallback(async () => {
    return withSaveLock(async () => {
      const state = await repository.resetState();
      applyState(setters, state);
      toast.success("Local data reset");
      return state;
    });
  }, [repository, setters, withSaveLock]);

  const updateSettings = useCallback(
    async (partial) => {
      if (!repository.updateSettings) {
        throw new Error("Settings cannot be updated.");
      }
      return withSaveLock(async () => {
        const state = await repository.updateSettings(partial);
        applyState(setters, state);
        return state;
      });
    },
    [repository, setters, withSaveLock]
  );

  const syncNow = useCallback(async () => {
    if (!repository.refreshFromCloud) {
      toast.message("Cloud sync is not available on this device.");
      return null;
    }
    return withSaveLock(async () => {
      const state = await repository.refreshFromCloud();
      applyState(setters, state);
      await refreshSyncMeta();
      const syncError = repository.getLastSyncError
        ? await repository.getLastSyncError()
        : null;
      if (syncError) {
        toast.warning(syncError);
      } else {
        toast.success("Synced with cloud");
      }
      return state;
    });
  }, [repository, setters, withSaveLock, refreshSyncMeta]);

  const dismissRecoveryMessage = useCallback(async () => {
    setRecoveryMessage(null);
    if (repository.clearRecoveryMessage) {
      await repository.clearRecoveryMessage();
    }
  }, [repository]);

  const value = useMemo(
    () => ({
      isLoading,
      isSaving,
      error,
      recoveryMessage,
      dismissRecoveryMessage,
      household,
      members,
      accounts,
      transactions,
      allocations,
      allocationItems,
      expenseCategories,
      settings,
      primaryAccountId,
      primaryAccount,
      totalBalanceInPaise,
      totalAddedInPaise,
      totalSpentInPaise,
      getAccountById,
      getAccountBySlug,
      getMonthlyExpenseStats,
      previewAllocation: (input) => previewAllocation(input, settings || {}),
      previewExpense,
      previewAdjustment,
      addAllocation,
      addExpense,
      adjustBalance,
      refreshData,
      resetLocalData,
      updateSettings,
      syncEnabled,
      syncNow,
      lastSyncError,
      lastSyncedAt,
      lockApp,
      accountIds: ACCOUNT_IDS,
    }),
    [
      isLoading,
      isSaving,
      error,
      recoveryMessage,
      dismissRecoveryMessage,
      household,
      members,
      accounts,
      transactions,
      allocations,
      allocationItems,
      expenseCategories,
      settings,
      primaryAccountId,
      primaryAccount,
      totalBalanceInPaise,
      totalAddedInPaise,
      totalSpentInPaise,
      getAccountById,
      getAccountBySlug,
      getMonthlyExpenseStats,
      addAllocation,
      addExpense,
      adjustBalance,
      refreshData,
      resetLocalData,
      updateSettings,
      syncEnabled,
      syncNow,
      lastSyncError,
      lastSyncedAt,
      lockApp,
    ]
  );

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>;
}

export function useMoneyContext() {
  const context = useContext(MoneyContext);
  if (!context) {
    throw new Error("useMoney must be used within MoneyProvider");
  }
  return context;
}
