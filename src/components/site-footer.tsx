"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to — the platform does not change mid-session. */
const noopSubscribe = () => () => {};

/**
 * Quiet discoverability line for the two hidden interactions. The modifier key
 * is read after hydration so it matches the visitor's actual platform.
 */
export default function SiteFooter() {
  const isApple = useSyncExternalStore(
    noopSubscribe,
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => false,
  );

  return (
    <footer className="flex items-center justify-between gap-4 py-6 font-mono text-[10px] text-muted-black/80">
      <span>© {new Date().getFullYear()}</span>
      <span className="flex items-center gap-3">
        <span>
          <kbd className="rounded border border-muted-black/30 px-1 py-0.5">
            {isApple ? "⌘" : "Ctrl"}
          </kbd>
          <kbd className="ml-0.5 rounded border border-muted-black/30 px-1 py-0.5">
            K
          </kbd>{" "}
          commands
        </span>
        <span>
          <kbd className="rounded border border-muted-black/30 px-1 py-0.5">
            ~
          </kbd>{" "}
          terminal
        </span>
      </span>
    </footer>
  );
}
