"use client";

import { useMoneyContext } from "@/providers/MoneyProvider";

export function useMoney() {
  return useMoneyContext();
}
