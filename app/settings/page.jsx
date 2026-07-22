"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Home, Lock, PlusCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMoney } from "@/hooks/useMoney";

const SETTINGS_ITEMS = [
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
];

export default function SettingsPage() {
  const {
    isLoading,
    accounts,
    primaryAccountId,
    updateSettings,
    isSaving,
    syncEnabled,
    lockApp,
  } = useMoney();

  const accountItems = useMemo(() => {
    const items = {};
    for (const account of accounts) {
      items[account.id] = account.name;
    }
    return items;
  }, [accounts]);

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

      <div className="space-y-4">
        <Card className="rounded-[1.5rem] border-border/80 shadow-soft">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                <Home className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Home account
                </p>
                <p className="text-xs text-muted-foreground">
                  Big number on home
                </p>
              </div>
            </div>
            <Select
              value={primaryAccountId}
              items={accountItems}
              disabled={isSaving}
              onValueChange={(value) => {
                if (value) updateSettings({ primaryAccountId: value });
              }}
            >
              <SelectTrigger
                id="primary-account"
                aria-label="Home account"
                className="min-h-11 w-full rounded-2xl"
              >
                <SelectValue placeholder="Choose account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {syncEnabled ? (
          <Card className="rounded-[1.5rem] border-border/80 shadow-soft">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <Lock className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Lock app</p>
                  <p className="text-xs text-muted-foreground">
                    Clear PIN on this device
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => lockApp?.()}
              >
                Lock
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-soft">
          <ul className="divide-y divide-border/70">
            {SETTINGS_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-16 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60"
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
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
