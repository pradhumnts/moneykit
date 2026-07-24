"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Cloud,
  Home,
  Lock,
  PlusCircle,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useMoney } from "@/hooks/useMoney";
import { formatDateInTimezone } from "@/lib/utils/dates";

export default function SettingsPage() {
  const {
    isLoading,
    accounts,
    primaryAccountId,
    syncEnabled,
    syncNow,
    isSaving,
    lastSyncError,
    lastSyncedAt,
    lockApp,
  } = useMoney();

  const primaryAccountName = useMemo(() => {
    return (
      accounts.find((account) => account.id === primaryAccountId)?.name ||
      "Choose account"
    );
  }, [accounts, primaryAccountId]);

  const syncDescription = useMemo(() => {
    if (lastSyncError) return lastSyncError;
    if (lastSyncedAt) {
      return `Last sync ${formatDateInTimezone(lastSyncedAt, "time")}`;
    }
    return "Tap to sync now";
  }, [lastSyncError, lastSyncedAt]);

  const settingsItems = useMemo(
    () => [
      {
        href: "/settings/home-account",
        title: "Home account",
        description: primaryAccountName,
        icon: Home,
      },
      {
        href: "/settings/allocations",
        title: "Money added",
        description: "Past entries and splits",
        icon: PlusCircle,
      },
      {
        href: "/settings/balances",
        title: "Balances",
        description: "All categories",
        icon: Wallet,
      },
    ],
    [primaryAccountName]
  );

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Settings" />

      <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-soft">
        <ul className="divide-y divide-border/70 stagger-children">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="pressable flex min-h-16 items-center gap-3 px-4 py-3.5 hover:bg-muted/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}

          {syncEnabled ? (
            <>
              <li>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => syncNow?.()}
                  className="pressable flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60 disabled:opacity-60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                    {isSaving ? (
                      <RefreshCw className="size-5 animate-spin" aria-hidden />
                    ) : (
                      <Cloud className="size-5" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Sync now
                    </p>
                    <p
                      className={`text-xs ${
                        lastSyncError
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {syncDescription}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => lockApp?.()}
                  className="pressable flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                    <Lock className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      Lock app
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clear PIN on this device
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </button>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </AppShell>
  );
}
