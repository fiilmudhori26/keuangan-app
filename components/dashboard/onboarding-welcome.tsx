"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, Sparkles, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "keuangan-welcomed";
const EVENT = "keuangan-welcomed-change";

// Fallback di memori bila localStorage tidak tersedia (mis. private browsing),
// supaya tombol tutup tetap berfungsi meski persistensi gagal.
let memoryWelcomed: boolean | null = null;

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
  return memoryWelcomed ?? readStorage();
}

// Server & first paint memperlakukan panel sebagai tertutup (tidak ada flash).
const getServerSnapshot = () => true;

/**
 * Panel onboarding pertama di dashboard: tampil hanya saat belum ada dompet
 * ATAU belum ada transaksi, dan belum pernah ditutup (`keuangan-welcomed`).
 */
export function OnboardingWelcome({
  hasWallet,
  hasTransaction,
}: {
  hasWallet: boolean;
  hasTransaction: boolean;
}) {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (hasWallet && hasTransaction) return null;
  if (dismissed) return null;

  const dismiss = () => {
    memoryWelcomed = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* abaikan */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  const steps = [
    { done: hasWallet, label: "Tambah dompet pertamamu", href: "/wallets" },
    { done: hasTransaction, label: "Catat pengeluaran pertamamu", href: "/transactions?add=1" },
  ];
  const next = steps.find((step) => !step.done) ?? steps[0];

  return (
    <section
      aria-label="Mulai dengan Keuangan"
      className="relative rounded-[14px] border border-border bg-card p-5"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Tutup sapaan"
        className="absolute right-1 top-1 flex size-11 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
      >
        <X className="size-5" aria-hidden />
      </button>

      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary"
      >
        <Sparkles className="size-8" />
      </span>
      <h2 className="mt-3 text-[18px] font-semibold leading-6 text-foreground">
        Selamat datang di Keuangan!
      </h2>
      <p className="mt-1 max-w-[40ch] text-[15px] leading-[22px] text-muted-foreground">
        Dua langkah singkat sebelum catatanmu jalan:
      </p>

      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex min-h-[44px] items-center gap-3 rounded-[10px] py-1 pr-2 transition-colors duration-150 ease-out hover:bg-muted/40"
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                  step.done ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                )}
              >
                {step.done ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-[15px] font-medium",
                  step.done ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-3">
        <Link
          href={next.href}
          className={cn(buttonVariants({ variant: "primary", size: "auto" }), "h-12")}
        >
          {!hasWallet ? "Tambah dompet" : "Catat pengeluaran"}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-12 items-center rounded-btn px-3 text-[14px] font-semibold text-primary transition-colors duration-150 ease-out hover:bg-muted"
        >
          Nanti saja
        </button>
      </div>
    </section>
  );
}
