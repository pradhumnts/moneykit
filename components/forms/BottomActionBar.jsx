"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BottomActionBar({
  children,
  className,
  embedded = false,
  plain = false,
  sticky = false,
}) {
  if (sticky) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-20 animate-slide-up border-t border-border/60 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div
          className={cn(
            "mx-auto flex w-full max-w-5xl flex-col gap-2.5 sm:flex-row",
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2.5 sm:flex-row",
        embedded
          ? "mt-1"
          : plain
            ? "mt-6"
            : "sticky bottom-24 z-20 mt-6 w-full bg-background/95 py-3 backdrop-blur md:bottom-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ActionButton({ className, ...props }) {
  return (
    <Button className={cn("min-h-12 w-full flex-1", className)} {...props} />
  );
}
