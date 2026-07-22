import { createElement } from "react";
import {
  getAccountIcon,
  getAccountProfile,
  getAccountAccentClass,
  getTransactionIcon,
} from "@/lib/utils/icons";
import { cn } from "@/lib/utils";

export function AccountIcon({ accountId, className }) {
  const profile = getAccountProfile(accountId);
  if (profile) {
    return (
      <img
        src={profile.src}
        alt={profile.alt}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  return createElement(getAccountIcon(accountId), {
    className,
    "aria-hidden": true,
  });
}

export function AccountAvatar({
  accountId,
  className = "size-11",
  iconClassName = "size-5",
}) {
  const profile = getAccountProfile(accountId);

  if (profile) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-1 ring-border/60",
          className
        )}
      >
        <img
          src={profile.src}
          alt={profile.alt}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        className,
        getAccountAccentClass(accountId)
      )}
    >
      <AccountIcon accountId={accountId} className={iconClassName} />
    </div>
  );
}

export function TransactionTypeIcon({ transactionType, direction, className }) {
  return createElement(getTransactionIcon(transactionType, direction), {
    className,
    "aria-hidden": true,
  });
}

export function TransactionAvatar({
  accountId,
  transactionType,
  direction,
  className = "size-12",
  iconClassName = "size-5",
}) {
  const profile = getAccountProfile(accountId);

  if (profile) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-1 ring-border/60",
          className
        )}
      >
        <img
          src={profile.src}
          alt={profile.alt}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-foreground",
        className
      )}
    >
      <TransactionTypeIcon
        transactionType={transactionType}
        direction={direction}
        className={iconClassName}
      />
    </div>
  );
}

export function StatusIcon({ icon, className }) {
  if (!icon) return null;
  return createElement(icon, {
    className,
    "aria-hidden": true,
  });
}
