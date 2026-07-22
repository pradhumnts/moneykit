export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateRootState(state) {
  if (!isObject(state)) {
    return { valid: false, reason: "Root state is not an object." };
  }

  const requiredArrays = [
    "members",
    "accounts",
    "transactions",
    "allocations",
    "allocationItems",
    "expenseCategories",
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(state[key])) {
      return { valid: false, reason: `Missing or invalid array: ${key}` };
    }
  }

  if (!isObject(state.household)) {
    return { valid: false, reason: "Missing household." };
  }

  if (!isObject(state.settings)) {
    return { valid: false, reason: "Missing settings." };
  }

  if (!isObject(state.metadata)) {
    return { valid: false, reason: "Missing metadata." };
  }

  if (typeof state.schemaVersion !== "number") {
    return { valid: false, reason: "Missing schemaVersion." };
  }

  return { valid: true, reason: null };
}
