"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, monthKey, shiftMonth } from "@/lib/date";

export function MonthSwitcher({ month, basePath }: { month: string; basePath: string }) {
  const current = monthKey();
  const next = shiftMonth(month, 1);
  const canGoNext = next <= current;

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`${basePath}?month=${shiftMonth(month, -1)}`}
        aria-label="Bulan sebelumnya"
        className="flex size-11 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 hover:bg-muted"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <span className="min-w-[132px] text-center text-[16px] leading-[24px] font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>
      {canGoNext ? (
        <Link
          href={`${basePath}?month=${next}`}
          aria-label="Bulan berikutnya"
          className="flex size-11 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 hover:bg-muted"
        >
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      ) : (
        <span className="flex size-11 items-center justify-center text-muted-foreground/40">
          <ChevronRight className="size-5" aria-hidden />
        </span>
      )}
    </div>
  );
}
