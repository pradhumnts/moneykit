"use client";

import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useMoney } from "@/hooks/useMoney";
import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/InlineAlert";
import { Button } from "@/components/ui/button";

export function AppShell({ children, hideNav = false }) {
  const { recoveryMessage, dismissRecoveryMessage } = useMoney();

  return (
    <div className="min-h-dvh bg-background">
      {!hideNav && <DesktopSidebar />}
      <div className={hideNav ? "" : "md:pl-64"}>
        <div
          className={
            hideNav
              ? "mx-auto min-h-dvh w-full max-w-5xl px-4 pb-8 pt-5 sm:px-6 md:pt-8"
              : "mx-auto min-h-dvh w-full max-w-5xl px-4 pb-32 pt-5 sm:px-6 md:pb-12 md:pt-8"
          }
        >
          {recoveryMessage ? (
            <Alert className="mb-5 border-border bg-card">
              <AlertTitle>Data recovery</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{recoveryMessage}</span>
                <Button size="sm" variant="outline" onClick={dismissRecoveryMessage}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {children}
        </div>
      </div>
      {!hideNav && <MobileNavigation />}
    </div>
  );
}
