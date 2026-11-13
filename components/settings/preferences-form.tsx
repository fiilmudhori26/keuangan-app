"use client";

import { useTheme } from "@/components/theme-provider";
import { useHideBalance } from "@/components/ui/hide-balance";
import type { ThemePreference } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Preferensi tampilan: tema, sakelar "Tampilkan saldo", dan bahasa (statis).
 * Tema langsung berlaku; saldo disimpan di localStorage (`keuangan-hide-balance`).
 */
export function PreferencesForm() {
  const { theme, setTheme } = useTheme();
  const [hidden, setHidden] = useHideBalance();
  const shown = !hidden;

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-muted-foreground">Tema</legend>
        <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-muted p-1">
          {(
            [
              ["system", "Ikuti sistem"],
              ["light", "Terang"],
              ["dark", "Gelap"],
            ] as Array<[ThemePreference, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              className={`h-11 rounded-[8px] text-[14px] font-semibold ${
                theme === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-foreground">Tampilkan saldo</p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            Saat dimatikan, nominal di dashboard disamarkan menjadi Rp •••••.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={shown}
          aria-label="Tampilkan saldo"
          onClick={() => setHidden(!hidden)}
          className="relative flex h-11 w-14 shrink-0 items-center"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-2 inset-x-0 rounded-full border border-border transition-colors duration-150 ease-out",
              shown ? "border-primary bg-primary" : "bg-muted",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "absolute left-1 size-6 rounded-full bg-card shadow-sm transition-transform duration-150 ease-out motion-reduce:transition-none",
              shown && "translate-x-[24px]",
            )}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-foreground">Bahasa</p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            Satu-satunya bahasa yang tersedia saat ini.
          </p>
        </div>
        <span className="shrink-0 text-[14px] font-semibold text-muted-foreground">Indonesia</span>
      </div>
    </div>
  );
}
