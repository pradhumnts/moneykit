import { PIN_HEADER } from "@/lib/sync/constants";

export async function getSyncStatus() {
  const response = await fetch("/api/sync/status", { cache: "no-store" });
  if (!response.ok) {
    return { syncEnabled: false };
  }
  return response.json();
}

export async function unlockPin(pin) {
  const response = await fetch("/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  return response.json();
}

export async function fetchCloudState(pin) {
  const response = await fetch("/api/sync", {
    headers: { [PIN_HEADER]: pin },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Could not load cloud data.");
  }

  return response.json();
}

export async function pushCloudState(pin, state) {
  const response = await fetch("/api/sync", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      [PIN_HEADER]: pin,
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Could not save cloud data.");
  }

  return response.json();
}
