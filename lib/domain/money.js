/**
 * Integer-paise money helpers.
 * ₹1 = 100 paise. Never use floating-point rupee math for balances.
 */

export function rupeesToPaise(rupees) {
  if (rupees === null || rupees === undefined || rupees === "") return 0;
  const normalized =
    typeof rupees === "string"
      ? rupees.replace(/,/g, "").trim()
      : rupees;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function paiseToRupees(paise) {
  const amount = Number(paise) || 0;
  return amount / 100;
}

export function roundPaise(paise) {
  return Math.round(Number(paise) || 0);
}

export function applyPercentageInPaise(amountInPaise, basisPoints) {
  const amount = roundPaise(amountInPaise);
  const points = Number(basisPoints) || 0;
  return Math.round((amount * points) / 10000);
}

export function dividePaise(amountInPaise, parts = 2) {
  const amount = roundPaise(amountInPaise);
  const safeParts = Math.max(1, Math.floor(parts));
  const base = Math.floor(amount / safeParts);
  const remainder = amount - base * safeParts;
  const shares = Array.from({ length: safeParts }, () => base);
  // Assign leftover paise to the first share (Big Savings by convention).
  if (shares.length > 0) {
    shares[0] += remainder;
  }
  return shares;
}

export function clampNonNegative(paise) {
  return Math.max(0, roundPaise(paise));
}

export function amountNeededToCap(balanceInPaise, capInPaise) {
  if (capInPaise === null || capInPaise === undefined) return 0;
  return Math.max(0, roundPaise(capInPaise) - roundPaise(balanceInPaise));
}

export function percentOfCap(balanceInPaise, capInPaise) {
  const cap = roundPaise(capInPaise);
  if (!cap) return 0;
  return Math.min(100, Math.round((roundPaise(balanceInPaise) / cap) * 100));
}
