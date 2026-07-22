import { paiseToRupees } from "@/lib/domain/money";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrCompactFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

export function formatPaiseAsINR(paise, { signed = false, showPlus = false } = {}) {
  const amount = Number(paise) || 0;
  const absolute = Math.abs(amount);
  const rupees = paiseToRupees(absolute);
  const hasPaise = absolute % 100 !== 0;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);

  if (amount < 0 || (signed && amount < 0)) return `−${formatted}`;
  if (showPlus && amount > 0) return `+${formatted}`;
  return formatted;
}

export function formatRupeesAsINR(rupees) {
  const value = Number(rupees) || 0;
  const hasPaise = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumberInputDisplay(rawDigitsAndDot) {
  if (!rawDigitsAndDot && rawDigitsAndDot !== 0) return "";
  const text = String(rawDigitsAndDot);
  if (text === "." || text.endsWith(".")) {
    const whole = text.slice(0, -1) || "0";
    const num = Number(whole.replace(/,/g, ""));
    if (!Number.isFinite(num)) return text;
    return `${inrCompactFormatter.format(num)}.`;
  }

  const [wholePart, decimalPart] = text.split(".");
  const wholeNumber = Number(wholePart.replace(/,/g, "") || "0");
  if (!Number.isFinite(wholeNumber)) return "";

  const formattedWhole = inrCompactFormatter.format(wholeNumber);
  if (decimalPart !== undefined) {
    return `${formattedWhole}.${decimalPart.slice(0, 2)}`;
  }
  return formattedWhole;
}

export function parseINRInputToRupees(input) {
  if (input === null || input === undefined) return null;
  const cleaned = String(input).replace(/₹/g, "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return value;
}

export { inrFormatter };
