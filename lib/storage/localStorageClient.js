import {
  LEGACY_STORAGE_BACKUP_KEY,
  LEGACY_STORAGE_KEY,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY,
} from "@/constants/allocationRules";

export function isLocalStorageAvailable() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__moneykit_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function migrateLegacyStorageKey(key) {
  if (key !== STORAGE_KEY && key !== STORAGE_BACKUP_KEY) return null;

  const legacyKey =
    key === STORAGE_KEY ? LEGACY_STORAGE_KEY : LEGACY_STORAGE_BACKUP_KEY;
  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue == null) return null;

  window.localStorage.setItem(key, legacyValue);
  window.localStorage.removeItem(legacyKey);
  return legacyValue;
}

export function readRawStorage(key = STORAGE_KEY) {
  if (!isLocalStorageAvailable()) return null;
  try {
    const value = window.localStorage.getItem(key);
    if (value != null) return value;
    return migrateLegacyStorageKey(key);
  } catch {
    return null;
  }
}

export function writeRawStorage(value, key = STORAGE_KEY) {
  if (!isLocalStorageAvailable()) {
    throw new Error("localStorage is unavailable in this browser.");
  }
  window.localStorage.setItem(key, value);
}

export function removeRawStorage(key = STORAGE_KEY) {
  if (!isLocalStorageAvailable()) return;
  window.localStorage.removeItem(key);
}

export function backupRawStorage(rawValue) {
  if (!isLocalStorageAvailable() || rawValue == null) return;
  try {
    window.localStorage.setItem(
      STORAGE_BACKUP_KEY,
      JSON.stringify({
        backedUpAt: new Date().toISOString(),
        payload: rawValue,
      })
    );
  } catch {
    // Ignore backup failures; recovery still proceeds with fresh state.
  }
}
