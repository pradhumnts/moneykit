/**
 * Repository contract documentation.
 * Implementations must expose async methods so a future database repository
 * can replace localStorage without changing callers.
 */
export const financeRepositoryContract = {
  getState: "() => Promise<HouseholdState>",
  getHousehold: "() => Promise<Household>",
  getMembers: "() => Promise<Member[]>",
  getAccounts: "() => Promise<Account[]>",
  getAccountById: "(accountId) => Promise<Account | null>",
  getTransactions: "(filters?) => Promise<Transaction[]>",
  getAllocations: "() => Promise<Allocation[]>",
  getExpenseCategories: "() => Promise<ExpenseCategory[]>",
  createAllocation: "(payload) => Promise<HouseholdState>",
  createExpense: "(payload) => Promise<HouseholdState>",
  createAdjustment: "(payload) => Promise<HouseholdState>",
  saveState: "(state) => Promise<HouseholdState>",
  resetState: "() => Promise<HouseholdState>",
};
