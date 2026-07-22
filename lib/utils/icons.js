import {
  Banknote,
  Home,
  PiggyBank,
  User,
  UserRound,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  HeartHandshake,
} from "lucide-react";
import { ACCOUNT_IDS } from "@/constants/allocationRules";

const ACCOUNT_ICONS = {
  [ACCOUNT_IDS.myDaily]: User,
  [ACCOUNT_IDS.wifeDaily]: UserRound,
  [ACCOUNT_IDS.family]: Home,
  [ACCOUNT_IDS.bigSavings]: PiggyBank,
  [ACCOUNT_IDS.futureExpenses]: Banknote,
};

const ACCOUNT_ACCENT_CLASS = {
  [ACCOUNT_IDS.myDaily]: "bg-[#eef2ef] text-primary",
  [ACCOUNT_IDS.wifeDaily]: "bg-[#f0f2f4] text-[#334155]",
  [ACCOUNT_IDS.family]: "bg-[#f7eee9] text-[#9a3412]",
  [ACCOUNT_IDS.bigSavings]: "bg-[#eef2f7] text-[#1e3a8a]",
  [ACCOUNT_IDS.futureExpenses]: "bg-[#eef5f2] text-[#14532d]",
};

export function getAccountIcon(accountId) {
  return ACCOUNT_ICONS[accountId] || Wallet;
}

export const ACCOUNT_PROFILE_IMAGES = {
  [ACCOUNT_IDS.myDaily]: { src: "/Pradyumn.webp", alt: "Pradyumn" },
  [ACCOUNT_IDS.wifeDaily]: { src: "/Sanjana.webp", alt: "Sanjana" },
};

export function getAccountProfile(accountId) {
  return ACCOUNT_PROFILE_IMAGES[accountId] ?? null;
}

export function getAccountAccentClass(accountId) {
  return ACCOUNT_ACCENT_CLASS[accountId] || "bg-muted text-muted-foreground";
}

export function getTransactionIcon(transactionType, direction) {
  if (transactionType === "expense") return ArrowDownLeft;
  if (transactionType === "balance-adjustment") return SlidersHorizontal;
  if (direction === "credit") return ArrowUpRight;
  return HeartHandshake;
}
