"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/money";

/** Harus sama dengan --motion-count di app/globals.css. */
const DEFAULT_DURATION = 700;

/**
 * Animated rupiah total. Renders the final value on the server and first paint
 * (no hydration mismatch), counts up once on mount, then eases from the previous
 * value whenever it changes. Honours reduced motion.
 */
export function CountUp({
  value,
  duration = DEFAULT_DURATION,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  // Initial state is the final value so SSR and first client render agree.
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);
  const mounted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const from = mounted.current ? previous.current : 0;
    const to = value;
    previous.current = to;
    mounted.current = true;

    if (from === to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setDisplay(to));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    let start: number | null = null;
    const delta = to - from;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(progress < 1 ? Math.round(from + delta * eased) : to);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={cn("block", className)}>{formatRupiah(display)}</span>;
}
