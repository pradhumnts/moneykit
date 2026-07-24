import { ACCOUNT_IDS, ALLOCATION_RULES, HOUSEHOLD_ID, SCHEMA_VERSION } from "@/constants/allocationRules";
import { calculateAllocation } from "@/lib/domain/calculateAllocation";
import { roundPaise } from "@/lib/domain/money";
import {
  createAllocationItem,
  createAllocationRecord,
  createTransaction,
} from "@/lib/domain/transactionFactory";
import { validateBalanceAdjustment, validateExpense } from "@/lib/domain/validateExpense";
import { createDefaultState } from "@/lib/storage/defaultData";
import { rowsToCamel, objectToSnake } from "@/lib/supabase/caseMap";
import { supabaseRest, supabaseRpc } from "@/lib/supabase/rest";
import { getTodayDateString } from "@/lib/utils/dates";
import { isStateEmpty } from "@/lib/sync/stateHelpers";

function updateAccountBalance(account, nextBalanceInPaise, now) {
  return {
    ...account,
    balanceInPaise: roundPaise(nextBalanceInPaise),
    updatedAt: now,
  };
}

async function fetchTable(table, query = "") {
  const rows = await supabaseRest(`/rest/v1/${table}?${query}`);
  return rowsToCamel(rows);
}

export async function householdExists() {
  const rows = await supabaseRest(
    `/rest/v1/households?id=eq.${HOUSEHOLD_ID}&select=id`
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function loadHouseholdState() {
  const exists = await householdExists();
  if (!exists) return null;

  const [householdRows, members, accounts, transactions, allocations, expenseCategories, settingsRows] =
    await Promise.all([
      fetchTable("households", `id=eq.${HOUSEHOLD_ID}&select=*`),
      fetchTable("members", `household_id=eq.${HOUSEHOLD_ID}&select=*&order=created_at.asc`),
      fetchTable("accounts", `household_id=eq.${HOUSEHOLD_ID}&select=*&order=sort_order.asc`),
      fetchTable(
        "transactions",
        `household_id=eq.${HOUSEHOLD_ID}&select=*&order=created_at.desc`
      ),
      fetchTable(
        "allocations",
        `household_id=eq.${HOUSEHOLD_ID}&select=*&order=created_at.desc`
      ),
      fetchTable(
        "expense_categories",
        `household_id=eq.${HOUSEHOLD_ID}&select=*&order=sort_order.asc`
      ),
      fetchTable("household_settings", `household_id=eq.${HOUSEHOLD_ID}&select=*`),
    ]);

  let items = [];
  const allocationIds = allocations.map((a) => a.id);
  if (allocationIds.length) {
    items = await fetchTable(
      "allocation_items",
      `allocation_id=in.(${allocationIds.join(",")})&select=*`
    );
  }

  const settingsRow = settingsRows[0];
  const household = householdRows[0];
  if (!household || !settingsRow) return null;

  return {
    schemaVersion: SCHEMA_VERSION,
    household,
    members,
    accounts,
    transactions,
    allocations,
    allocationItems: items,
    expenseCategories,
    settings: {
      currency: settingsRow.currency,
      locale: settingsRow.locale,
      timezone: settingsRow.timezone,
      myDailyCapInPaise: settingsRow.myDailyCapInPaise,
      wifeDailyCapInPaise: settingsRow.wifeDailyCapInPaise,
      primaryAccountId: settingsRow.primaryAccountId,
    },
    metadata: {
      createdAt: household.createdAt,
      updatedAt: household.updatedAt,
      lastMigrationAt: null,
    },
  };
}

async function upsertRows(table, rows) {
  if (!rows?.length) return;
  await supabaseRest(`/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: rows.map(objectToSnake),
  });
}

async function touchHousehold(now = new Date().toISOString()) {
  await supabaseRest(`/rest/v1/households?id=eq.${HOUSEHOLD_ID}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: { updated_at: now },
  });
}

export async function replaceHouseholdState(state) {
  // Wipe existing household data then insert (used for bootstrap/reset).
  if (await householdExists()) {
    await supabaseRest(`/rest/v1/households?id=eq.${HOUSEHOLD_ID}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
  }

  const now = new Date().toISOString();
  await upsertRows("households", [state.household]);
  await upsertRows("members", state.members);
  await upsertRows("accounts", state.accounts);
  await upsertRows("expense_categories", state.expenseCategories);
  await supabaseRest(`/rest/v1/household_settings?on_conflict=household_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: objectToSnake({
      householdId: state.household.id,
      currency: state.settings.currency,
      locale: state.settings.locale,
      timezone: state.settings.timezone,
      myDailyCapInPaise: state.settings.myDailyCapInPaise,
      wifeDailyCapInPaise: state.settings.wifeDailyCapInPaise,
      primaryAccountId: state.settings.primaryAccountId,
      updatedAt: now,
    }),
  });
  await upsertRows("allocations", state.allocations);
  await upsertRows("allocation_items", state.allocationItems);
  await upsertRows(
    "transactions",
    state.transactions.map((tx) => ({ ...tx, syncStatus: "synced" }))
  );
  await touchHousehold(now);
  return loadHouseholdState();
}

export async function seedDefaultHousehold() {
  return replaceHouseholdState(createDefaultState());
}

export async function ensureHouseholdState() {
  const existing = await loadHouseholdState();
  if (existing && !isStateEmpty(existing)) return existing;

  // Migrate from legacy blob if present.
  try {
    const rows = await supabaseRest(
      `/rest/v1/household_sync?id=eq.default&select=state`
    );
    const blob = rows?.[0]?.state;
    if (blob && typeof blob === "object" && !isStateEmpty(blob)) {
      return replaceHouseholdState(blob);
    }
  } catch {
    // Legacy table may not exist.
  }

  if (existing) return existing;
  return seedDefaultHousehold();
}

export async function createExpenseInDb(payload) {
  const state = await ensureHouseholdState();
  const now = new Date().toISOString();
  const date = payload.transactionDate || getTodayDateString();
  const account = state.accounts.find((entry) => entry.id === payload.accountId);
  if (!account) throw new Error("Account not found.");

  const validation = validateExpense({
    amountInPaise: payload.amountInPaise,
    accountBalanceInPaise: account.balanceInPaise,
    accountId: payload.accountId,
    expenseCategoryId: payload.expenseCategoryId,
    transactionDate: date,
  });

  if (!validation.isValid) {
    const error = new Error("Expense validation failed.");
    error.validation = validation;
    throw error;
  }

  const amount = validation.amountInPaise;
  const category = state.expenseCategories.find(
    (entry) => entry.id === payload.expenseCategoryId
  );

  const transaction = createTransaction({
    accountId: payload.accountId,
    amountInPaise: amount,
    direction: "debit",
    transactionType: "expense",
    title: payload.title || category?.name || "Expense",
    note: payload.note || "",
    expenseCategoryId: payload.expenseCategoryId,
    memberId: payload.memberId || null,
    balanceBeforeInPaise: account.balanceInPaise,
    balanceAfterInPaise: account.balanceInPaise - amount,
    transactionDate: date,
    now,
  });

  await supabaseRpc("apply_expense", {
    p_tx: transaction,
    p_account_id: payload.accountId,
    p_amount: amount,
  });
  await touchHousehold(now);
  return loadHouseholdState();
}

export async function createAdjustmentInDb(payload) {
  const state = await ensureHouseholdState();
  const now = new Date().toISOString();
  const date = payload.transactionDate || getTodayDateString();
  const account = state.accounts.find((entry) => entry.id === payload.accountId);
  if (!account) throw new Error("Account not found.");

  const validation = validateBalanceAdjustment({
    newBalanceInPaise: payload.newBalanceInPaise,
    note: payload.note,
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
    accountId: payload.accountId,
    amountInPaise: Math.abs(difference),
    direction,
    transactionType: "balance-adjustment",
    title: `Balance adjusted from ₹${(previousBalance / 100).toLocaleString("en-IN")} to ₹${(nextBalance / 100).toLocaleString("en-IN")}`,
    note: payload.note,
    memberId: payload.memberId || null,
    balanceBeforeInPaise: previousBalance,
    balanceAfterInPaise: nextBalance,
    transactionDate: date,
    now,
  });

  await supabaseRpc("apply_adjustment", {
    p_tx: transaction,
    p_account_id: payload.accountId,
    p_new_balance: nextBalance,
  });
  await touchHousehold(now);
  return loadHouseholdState();
}

export async function createAllocationInDb(payload) {
  const state = await ensureHouseholdState();
  const now = new Date().toISOString();
  const date = payload.transactionDate || getTodayDateString();

  const myDaily = state.accounts.find((a) => a.id === ACCOUNT_IDS.myDaily);
  const wifeDaily = state.accounts.find((a) => a.id === ACCOUNT_IDS.wifeDaily);

  const preview = calculateAllocation({
    amountInPaise: payload.amountInPaise,
    myDailyBalanceInPaise:
      payload.myDailyBalanceInPaise ?? myDaily?.balanceInPaise ?? 0,
    wifeDailyBalanceInPaise:
      payload.wifeDailyBalanceInPaise ?? wifeDaily?.balanceInPaise ?? 0,
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
  const note = payload.note || "";

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
    payload.myDailyBalanceInPaise,
    "My Daily Expense"
  );
  syncDailyBalance(
    ACCOUNT_IDS.wifeDaily,
    payload.wifeDailyBalanceInPaise,
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
      title: "Family Expense",
    },
    {
      accountId: ACCOUNT_IDS.bigSavings,
      amount: preview.bigSavings,
      type: "remainder-split",
      basisPoints: ALLOCATION_RULES.savingsSplitBasisPoints,
      title: "Big Savings",
    },
    {
      accountId: ACCOUNT_IDS.futureExpenses,
      amount: preview.futureExpenses,
      type: "remainder-split",
      basisPoints: ALLOCATION_RULES.savingsSplitBasisPoints,
      title: "Future Big Expenses",
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

  const changedAccounts = accounts.filter((account) => {
    const previous = state.accounts.find((entry) => entry.id === account.id);
    return (
      !previous ||
      previous.balanceInPaise !== account.balanceInPaise ||
      previous.totalAddedInPaise !== account.totalAddedInPaise
    );
  });

  await supabaseRpc("apply_allocation_payload", {
    p_payload: {
      allocation,
      allocationItems,
      transactions,
      accounts: changedAccounts,
    },
  });
  await touchHousehold(now);
  return loadHouseholdState();
}

export async function updateSettingsInDb(partial) {
  await ensureHouseholdState();
  const now = new Date().toISOString();
  const body = objectToSnake({
    ...partial,
    updatedAt: now,
  });
  await supabaseRest(`/rest/v1/household_settings?household_id=eq.${HOUSEHOLD_ID}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body,
  });
  await touchHousehold(now);
  return loadHouseholdState();
}

export async function resetHouseholdInDb() {
  return replaceHouseholdState(createDefaultState());
}

export async function bootstrapHouseholdFromState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Invalid bootstrap state.");
  }
  const existing = await loadHouseholdState();
  if (existing && !isStateEmpty(existing)) {
    return existing;
  }
  return replaceHouseholdState(state);
}
