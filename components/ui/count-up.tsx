"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/money";

/**
 * Animated rupiah total. Renders the final value on the server and first paint
 * (no hydration mismatch), then counts up once on mount. Honours reduced motion.
 */
export function CountUp({
  value,
  duration = 700,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  // Initial state is the final value so SSR and first client render agree.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start: number | null = null;
    const from = 0;
    const delta = value - from;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(progress < 1 ? Math.round(from + delta * eased) : value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={cn("block", className)}>{formatRupiah(display)}</span>;
}
