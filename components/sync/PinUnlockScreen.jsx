"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO_WEBP, APP_NAME } from "@/constants/branding";

export function PinUnlockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onUnlock(pin.trim());
    } catch (err) {
      setError(err?.message || "Could not unlock.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src={APP_LOGO_WEBP}
            alt={APP_NAME}
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Enter PIN</h1>
            <p className="text-sm text-muted-foreground">
              Saved on this device after unlock
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Household PIN"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="min-h-12 rounded-2xl text-center text-lg tracking-[0.3em]"
            aria-invalid={Boolean(error)}
            autoFocus
          />

          {error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!pin.trim() || isSubmitting}
          >
            {isSubmitting ? "Checking…" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
