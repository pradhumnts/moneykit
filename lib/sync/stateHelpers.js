export function isStateEmpty(state) {
  if (!state || !Array.isArray(state.accounts)) return true;

  const hasActivity = (state.transactions?.length ?? 0) > 0;
  const hasBalance = state.accounts.some(
    (account) => (account.balanceInPaise || 0) > 0
  );

  return !hasActivity && !hasBalance;
}

export function getStateUpdatedAt(state) {
  return state?.metadata?.updatedAt || "";
}
