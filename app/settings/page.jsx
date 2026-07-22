"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Home, Lock, PlusCircle, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useMoney } from "@/hooks/useMoney";

export default function SettingsPage() {
  const {
    isLoading,
    accounts,
    primaryAccountId,
    syncEnabled,
    lockApp,
  } = useMoney();

  const primaryAccountName = useMemo(() => {
    return (
      accounts.find((account) => account.id === primaryAccountId)?.name ||
      "Choose account"
    );
  }, [accounts, primaryAccountId]);

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
          ) : null}
        </ul>
      </div>
    </AppShell>
  );
}
