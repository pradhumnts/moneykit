"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TAB_PATHS = new Set(["/", "/expenses", "/activity", "/settings"]);

function isTabPath(pathname) {
  return TAB_PATHS.has(pathname);
}

function pathDepth(pathname) {
  if (!pathname || pathname === "/") return 0;
  return pathname.split("/").filter(Boolean).length;
}

function getTransition(from, to) {
  if (!from || from === to) return "fade";
  if (isTabPath(from) && isTabPath(to)) return "fade";

  if (to.startsWith(`${from}/`)) return "forward";
  if (from.startsWith(`${to}/`)) return "back";

  if (from === "/" && !isTabPath(to)) return "forward";
  if (to === "/" && !isTabPath(from)) return "back";

  const fromDepth = pathDepth(from);
  const toDepth = pathDepth(to);
  if (toDepth > fromDepth) return "forward";
  if (toDepth < fromDepth) return "back";

  if (!isTabPath(to)) return "forward";
  return "fade";
}

const TRANSITION_CLASS = {
  fade: "animate-page-enter",
  forward: "animate-slide-in-right",
  back: "animate-slide-in-left",
};

export function PageEnter({ children, className = "" }) {
  const pathname = usePathname();
  const previousPathRef = useRef(null);
  const transitionRef = useRef("fade");

  if (previousPathRef.current !== pathname) {
    transitionRef.current = getTransition(previousPathRef.current, pathname);
    previousPathRef.current = pathname;
  }

  return (
    <div
      key={pathname}
      className={cn(
        "min-w-0 will-change-transform",
        TRANSITION_CLASS[transitionRef.current] || TRANSITION_CLASS.fade,
        className
      )}
    >
      {children}
    </div>
  );
}
