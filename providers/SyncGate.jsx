"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PinUnlockScreen } from "@/components/sync/PinUnlockScreen";
import { createCloudDbRepository } from "@/lib/repositories/cloudDbRepository";
import { localStorageFinanceRepository } from "@/lib/repositories/localStorageFinanceRepository";
import { clearStoredPin, getStoredPin, setStoredPin } from "@/lib/sync/pinStorage";
import { getSyncStatus, unlockPin } from "@/lib/sync/syncClient";
import { MoneyProvider } from "@/providers/MoneyProvider";

export function SyncGate({ children }) {
  const [phase, setPhase] = useState("loading");
  const [pin, setPin] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const status = await getSyncStatus();
        if (!active) return;

        setSyncEnabled(Boolean(status.syncEnabled));
        if (!status.syncEnabled) {
          setPhase("ready");
          return;
        }

        const storedPin = getStoredPin();
        if (storedPin) {
          setPin(storedPin);
          setPhase("ready");
          return;
        }

        setPhase("pin");
      } catch {
        if (active) {
          setSyncEnabled(false);
          setPhase("ready");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const repository = useMemo(() => {
    if (syncEnabled && pin) {
      return createCloudDbRepository(pin);
    }
    return localStorageFinanceRepository;
  }, [syncEnabled, pin]);

  const handleUnlock = useCallback(async (enteredPin) => {
    const result = await unlockPin(enteredPin);
    if (!result.ok) {
      throw new Error(result.error || "Incorrect PIN.");
    }

    setStoredPin(enteredPin);
    setPin(enteredPin);
    setPhase("ready");
  }, []);

  const lockApp = useCallback(() => {
    clearStoredPin();
    setPin(null);
    setPhase(syncEnabled ? "pin" : "ready");
  }, [syncEnabled]);

  if (phase === "loading") {
    return <LoadingState />;
  }

  if (phase === "pin") {
    return <PinUnlockScreen onUnlock={handleUnlock} />;
  }

  return (
    <MoneyProvider repository={repository} syncEnabled={syncEnabled} lockApp={lockApp}>
      {children}
    </MoneyProvider>
  );
}
