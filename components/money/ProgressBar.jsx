"use client";

import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, className, trackClassName, indicatorClassName }) {
  return (
    <Progress
      value={Math.max(0, Math.min(100, value || 0))}
      className={cn("w-full", className)}
    >
      <ProgressTrack className={cn("h-2.5 w-full rounded-full", trackClassName)}>
        <ProgressIndicator className={cn("rounded-full", indicatorClassName)} />
      </ProgressTrack>
    </Progress>
  );
}
