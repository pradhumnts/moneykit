"use client";

import { createElement } from "react";
import { PlusCircle, Receipt, Inbox } from "lucide-react";
import { MoneyKitLogo } from "@/components/brand/MoneyKitLogo";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ICONS = {
  money: PlusCircle,
  expense: Receipt,
  activity: Inbox,
};

export function EmptyState({
  icon = "default",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  const IconComponent = ICONS[icon];

  return (
    <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-border bg-card px-6 py-14 text-center shadow-soft animate-page-enter">
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted text-foreground">
        {IconComponent ? (
          createElement(IconComponent, {
            className: "size-7",
            "aria-hidden": true,
          })
        ) : (
          <MoneyKitLogo size={22} className="size-[22px] rounded-lg" />
        )}
      </div>
      <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={cn(buttonVariants(), "mt-6 min-h-12 px-6")}
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6 min-h-12" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
