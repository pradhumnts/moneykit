"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ title = "Something went wrong", description, onRetry }) {
  return (
    <div className="rounded-[1.25rem] border border-destructive/20 bg-card px-5 py-8 text-center">
      <AlertCircle className="mx-auto mb-3 size-8 text-destructive" aria-hidden />
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button className="mt-4 min-h-11" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
