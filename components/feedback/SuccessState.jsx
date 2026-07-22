"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SuccessState({
  title,
  description,
  children,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-2 py-6 text-center">
      <div className="relative mb-6 flex size-28 items-center justify-center rounded-full bg-muted">
        <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-soft">
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </div>
      </div>
      <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-6 w-full rounded-[1.5rem] border border-border/80 bg-card p-4 text-left shadow-soft">
          {children}
        </div>
      ) : null}
      <div className="mt-7 flex w-full flex-col gap-2.5">
        {primaryLabel && primaryHref ? (
          <Link
            href={primaryHref}
            className={cn(buttonVariants({ variant: "lime" }), "min-h-12 w-full")}
          >
            {primaryLabel}
          </Link>
        ) : null}
        {secondaryLabel && secondaryHref ? (
          <Link
            href={secondaryHref}
            className={cn(buttonVariants(), "min-h-12 w-full")}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
