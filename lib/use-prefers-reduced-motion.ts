"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Satu MediaQueryList & satu listener untuk seluruh aplikasi; setiap hook
// berlangganan lewat himpunan listener internal, bukan satu listener per komponen.
let mediaQuery: MediaQueryList | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function getQuery() {
  if (mediaQuery === null) {
    mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    mediaQuery.addEventListener("change", notify);
  }
  return mediaQuery;
}

function subscribe(callback: () => void) {
  getQuery();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return getQuery().matches;
}

const getServerSnapshot = () => false;

/** Preferensi `prefers-reduced-motion: reduce`, reaktif terhadap perubahan OS. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
