import { PIN_STORAGE_KEY } from "@/lib/sync/constants";

export function getStoredPin() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PIN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPin(pin) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PIN_STORAGE_KEY, String(pin));
}

export function clearStoredPin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PIN_STORAGE_KEY);
}
