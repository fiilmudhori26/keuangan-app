"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { formatMonthLabel, monthKey, todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const WEEKDAY_FULL = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const dayAria = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function keyOf(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function DatePickerSheet({
  open,
  onClose,
  value,
  onChange,
  max,
}: {
  open: boolean;
  onClose: () => void;
  /** YYYY-MM-DD */
  value: string;
  onChange: (date: string) => void;
  /** Batas tertinggi tanggal, bawaan hari ini (YYYY-MM-DD). */
  max?: string;
}) {
  const maxKey = max ?? todayKey();
  const today = todayKey();
  const maxMonth = maxKey.slice(0, 7);
  const clampMonth = (month: string) => (month > maxMonth ? maxMonth : month);
  const [viewMonth, setViewMonth] = useState(() => clampMonth(value.slice(0, 7)));
  const firstDayRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Tampilkan bulan dari nilai terpilih setiap kali dibuka (state turunan saat render).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setViewMonth(clampMonth(value.slice(0, 7)));
  }

  // Esc menutup picker saja; sheet induk tetap terbuka (listener capture di dokumen).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fokus mendarat di sel tanggal 1 setelah panel Sheet selesai difokuskan.
  // Bila sel tanggal 1 nonaktif (seluruh hari bulan ini di masa depan), fokus ke
  // panel grid (tabIndex -1), bukan ke sel yang disabled.
  const dayOneKey = `${viewMonth}-01`;
  const dayOneDisabled = dayOneKey > maxKey;
  useEffect(() => {
    if (!open) return;
    const handle = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (dayOneDisabled) {
          panelRef.current?.focus();
        } else {
          firstDayRef.current?.focus();
        }
      });
    });
    return () => cancelAnimationFrame(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canGoNext = viewMonth < maxMonth;

  const weeks = useMemo(() => {
    const [year, month] = viewMonth.split("-").map(Number);
    const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Senin = 0
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: Array<number | null> = [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: Array<Array<number | null>> = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewMonth]);

  const [viewYear, viewMonthNum] = viewMonth.split("-").map(Number);

  function shiftMonth(delta: number) {
    const date = new Date(viewYear, viewMonthNum - 1 + delta, 1);
    setViewMonth(monthKey(date));
  }

  function pick(key: string) {
    if (key > maxKey) return;
    onChange(key);
    onClose();
  }

  function moveFocus(delta: number) {
    const grid = firstDayRef.current?.closest("[role=grid]");
    if (!grid) return;
    const buttons = Array.from(
      grid.querySelectorAll<HTMLButtonElement>("button[data-day]:not(:disabled)"),
    );
    if (buttons.length === 0) return;
    const active = document.activeElement;
    const currentIndex = buttons.findIndex((button) => button === active);
    const base = currentIndex >= 0 ? currentIndex : 0;
    const next = Math.min(buttons.length - 1, Math.max(0, base + delta));
    buttons[next]?.focus();
  }

  function onGridKeyDown(event: React.KeyboardEvent) {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    moveFocus(delta);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Pilih tanggal">
      <div className={open ? "animate-fade-up-fast" : undefined}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="flex size-11 items-center justify-center rounded-btn text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <p aria-live="polite" className="text-[16px] leading-6 font-semibold text-foreground">
            {formatMonthLabel(viewMonth)}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={!canGoNext}
            aria-label="Bulan berikutnya"
            className="flex size-11 items-center justify-center rounded-btn text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div
          role="grid"
          ref={panelRef}
          tabIndex={-1}
          aria-label={`Kalender ${formatMonthLabel(viewMonth)}`}
          onKeyDown={onGridKeyDown}
          className="mt-2 focus-visible:outline-none"
        >
          <div role="row" className="grid grid-cols-7 gap-1">
            {WEEKDAY_SHORT.map((day, index) => (
              <span
                key={day}
                role="columnheader"
                aria-label={WEEKDAY_FULL[index]}
                className="flex h-11 items-center justify-center text-[12px] leading-4 font-medium text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>
          {weeks.map((week, rowIndex) => (
            <div role="row" key={rowIndex} className="mt-1 grid grid-cols-7 gap-1">
              {week.map((day, cellIndex) => {
                if (day === null) {
                  return <span key={cellIndex} role="gridcell" aria-hidden className="h-11" />;
                }
                const key = keyOf(viewYear, viewMonthNum - 1, day);
                const isFuture = key > maxKey;
                const isSelected = key === value;
                const isToday = key === today;
                const isFirst = day === 1;
                return (
                  <span key={cellIndex} role="gridcell" aria-selected={isSelected}>
                    <button
                      type="button"
                      ref={isFirst ? firstDayRef : undefined}
                      data-day={day}
                      disabled={isFuture}
                      tabIndex={isSelected ? 0 : -1}
                      aria-pressed={isSelected}
                      aria-label={dayAria.format(new Date(viewYear, viewMonthNum - 1, day))}
                      onClick={() => pick(key)}
                      className={cn(
                        "num flex h-11 w-full items-center justify-center rounded-[10px] text-[14px] leading-5 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
                        isSelected
                          ? "bg-primary font-semibold text-primary-foreground"
                          : isToday
                            ? "font-medium text-primary ring-1 ring-inset ring-primary"
                            : "font-medium text-foreground hover:bg-muted",
                      )}
                    >
                      {day}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => pick(today)}
          disabled={today > maxKey}
          aria-label="Hari ini"
          className="mt-3 flex h-11 w-full items-center justify-center rounded-btn text-[14px] leading-5 font-semibold text-primary transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
        >
          Hari ini
        </button>
      </div>
    </Sheet>
  );
}
