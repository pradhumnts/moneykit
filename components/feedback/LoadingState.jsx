"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 4 }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-9 w-52 rounded-full bg-muted" />
      <Skeleton className="h-44 w-full rounded-[1.75rem] bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-36 rounded-[1.5rem] bg-card"
          />
        ))}
      </div>
    </div>
  );
}
