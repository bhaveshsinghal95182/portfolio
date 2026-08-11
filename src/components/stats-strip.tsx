"use client";

import { animate, useInView } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useMotionPreference } from "@/lib/motion-preference";
import { formatCompact } from "@/lib/stats";

interface Stat {
  label: string;
  value: number;
  /** Compact numbers (12.4k) for big counts, plain for small ones. */
  compact?: boolean;
  suffix?: string;
}

// useLayoutEffect would warn during SSR; on the server there is nothing to lay
// out anyway.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Counts up on first view. The final number is what renders on the server — so
 * it survives with JS off and matches during hydration — and the DOM text is
 * then driven directly, which lets the count start before the browser paints
 * instead of flashing the final value first.
 */
function Counter({ value, compact, suffix }: Omit<Stat, "label">) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { prefersReducedMotion } = useMotionPreference();

  const format = useCallback(
    (amount: number) =>
      `${compact ? formatCompact(amount) : amount.toLocaleString("en-US")}${suffix ?? ""}`,
    [compact, suffix],
  );

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    // Reset to zero before paint so the count-up never flashes its own answer;
    // with motion off, snap straight to the final number instead.
    ref.current.textContent = prefersReducedMotion ? format(value) : format(0);
  }, [prefersReducedMotion, format, value]);

  useEffect(() => {
    const node = ref.current;
    if (prefersReducedMotion || !inView || !node) return;

    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = format(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [inView, value, prefersReducedMotion, format]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 border-y border-muted-black/20 py-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col">
          <dd className="font-mono text-base tracking-tight text-title">
            <Counter
              value={stat.value}
              compact={stat.compact}
              suffix={stat.suffix}
            />
          </dd>
          <dt className="font-jost text-[10px] uppercase tracking-wide text-muted-black">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
