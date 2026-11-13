"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "keuangan-hide-balance";
const EVENT = "keuangan-hide-balance-change";

// Fallback di memori bila localStorage tidak tersedia (mis. private browsing),
// supaya toggle tetap berfungsi meski persistensi gagal.
let memoryHidden: boolean | null = null;

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getSnapshot() {
  return memoryHidden ?? readStorage();
}

const getServerSnapshot = () => false;

/** Preferensi "Sembunyikan saldo" — localStorage saja, default tampil. */
export function useHideBalance() {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setHidden = useCallback((next: boolean) => {
    memoryHidden = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* abaikan - preferensi tidak pernah memblokir penggunaan */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [hidden, setHidden] as const;
}

/**
 * Merender nominal apa adanya, atau menyamarkan jadi `Rp •••••` saat saldo
 * disembunyikan. Children tetap terpasang (animasi/state tidak hilang);
 * yang disembunyikan hanya visualnya.
 */
export function MaskedAmount({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [hidden] = useHideBalance();
  return (
    <span
      className={cn("num", className)}
      {...(hidden ? { role: "img", "aria-label": "Nominal disembunyikan" } : {})}
    >
      <span aria-hidden={hidden || undefined} className={hidden ? "hidden" : undefined}>
        {children}
      </span>
      {hidden ? <span aria-hidden>Rp •••••</span> : null}
    </span>
  );
}
