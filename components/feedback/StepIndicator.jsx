"use client";

import { cn } from "@/lib/utils";

export function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="mb-6 flex w-full items-center" aria-label="Progress">
      {steps.map((step, index) => {
        const active = index === currentStep;
        const complete = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={step} className={cn("flex items-center", !isLast && "min-w-0 flex-1")}>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  active && "bg-primary text-primary-foreground shadow-soft scale-105",
                  complete && "bg-lime text-lime-foreground",
                  !active && !complete && "bg-muted text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] font-semibold sm:block",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>

            {!isLast ? (
              <div
                className={cn(
                  "mx-2 h-1 min-w-0 flex-1 rounded-full transition-colors duration-300",
                  complete ? "bg-primary/30" : "bg-border"
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
