"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AccountAvatar } from "@/components/money/AccountIcon";
import { useMoney } from "@/hooks/useMoney";
import { cn } from "@/lib/utils";

export default function HomeAccountSettingsPage() {
  const {
    isLoading,
    error,
    refreshData,
    accounts,
    primaryAccountId,
    updateSettings,
    isSaving,
  } = useMoney();

  if (isLoading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState description={error} onRetry={refreshData} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href="/settings"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Settings
      </Link>

      <PageHeader
        title="Home account"
        description="Big number on home"
      />

      <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-soft">
        <ul className="divide-y divide-border/70">
          {accounts.map((account) => {
            const selected = account.id === primaryAccountId;
            return (
              <li key={account.id}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    if (!selected) {
                      updateSettings({ primaryAccountId: account.id });
                    }
                  }}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60 disabled:opacity-60"
                  )}
                >
                  <AccountAvatar
                    accountId={account.id}
                    className="size-10"
                    iconClassName="size-5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {account.name}
                    </p>
                  </div>
                  {selected ? (
                    <Check
                      className="size-5 shrink-0 text-primary"
                      aria-label="Selected"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
