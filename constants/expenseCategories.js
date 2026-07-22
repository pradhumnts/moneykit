import { HOUSEHOLD_ID } from "./allocationRules";

export const EXPENSE_CATEGORY_DEFINITIONS = [
  { id: "expense_category_groceries", slug: "groceries", name: "Groceries", sortOrder: 1 },
  { id: "expense_category_food", slug: "food", name: "Food", sortOrder: 2 },
  { id: "expense_category_travel", slug: "travel", name: "Travel", sortOrder: 3 },
  { id: "expense_category_shopping", slug: "shopping", name: "Shopping", sortOrder: 4 },
  { id: "expense_category_bills", slug: "bills", name: "Bills", sortOrder: 5 },
  { id: "expense_category_health", slug: "health", name: "Health", sortOrder: 6 },
  { id: "expense_category_home", slug: "home", name: "Home", sortOrder: 7 },
  { id: "expense_category_family", slug: "family", name: "Family", sortOrder: 8 },
  { id: "expense_category_personal", slug: "personal", name: "Personal", sortOrder: 9 },
  { id: "expense_category_donation", slug: "donation", name: "Donation", sortOrder: 10 },
  { id: "expense_category_other", slug: "other", name: "Other", sortOrder: 11 },
];

export function createDefaultExpenseCategories(now = new Date().toISOString()) {
  return EXPENSE_CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    householdId: HOUSEHOLD_ID,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));
}
