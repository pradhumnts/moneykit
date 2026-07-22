import { cn } from "@/lib/utils";

export function InlineAlert({ className, ...props }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-[1.35rem] border border-border/80 bg-card px-4 py-3.5 text-sm shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export function Alert({ className, ...props }) {
  return <InlineAlert className={className} {...props} />;
}

export function AlertTitle({ className, ...props }) {
  return (
    <h2
      className={cn("mb-1 text-sm font-bold text-foreground", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
