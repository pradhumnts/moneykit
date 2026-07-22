"use client";

import { createElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Receipt, Settings, RotateCcw } from "lucide-react";
import { MoneyKitLogo } from "@/components/brand/MoneyKitLogo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMoney } from "@/hooks/useMoney";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { resetLocalData, isSaving } = useMoney();

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-border/80 md:bg-white">
      <div className="flex items-center gap-3 px-5 py-7">
        <MoneyKitLogo size={32} className="size-8 rounded-2xl" priority />
        <div>
          <p className="font-heading text-lg font-extrabold tracking-tight text-foreground">
            MoneyKit
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Household money
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 px-3" aria-label="Main">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {createElement(link.icon, {
                className: "size-4.5",
                "aria-hidden": true,
              })}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-4">
        <AlertDialog>
          <AlertDialogTrigger
            disabled={isSaving}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-start text-muted-foreground"
            )}
          >
            <RotateCcw className="size-3.5" />
            Reset local data
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all local data?</AlertDialogTitle>
              <AlertDialogDescription>
                Clears all data in this browser. Cannot undo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep data</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetLocalData()}>
                Reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
