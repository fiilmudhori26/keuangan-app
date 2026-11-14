"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCompact, formatRupiah } from "@/lib/money";
import { formatDateKey } from "@/lib/date";

export function TrendChart({
  data,
  onBrand = false,
}: {
  data: Array<{ date: string; value: number }>;
  /** Warna garis & teks adaptif untuk di atas panel brand penuh (hero saldo). */
  onBrand?: boolean;
}) {
  if (data.length < 2) {
    return (
      <p className={onBrand ? "text-[13px] text-primary-foreground" : "text-[13px] text-muted-foreground"}>
        Grafik tren muncul setelah ada transaksi.
      </p>
    );
  }
  const last = data[data.length - 1];
  return (
    <div>
      <div className="h-20" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={onBrand ? "var(--primary-foreground)" : "var(--primary)"}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as { date: string; value: number };
                return (
                  <div className="rounded-[10px] border border-border bg-popover px-2 py-1 text-[12px] text-popover-foreground">
                    {formatDateKey(point.date)} · <span className="num">{formatRupiah(point.value)}</span>
                  </div>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Tren saldo bulan ini berakhir di {formatRupiah(last.value)} pada {formatDateKey(last.date)}.
      </p>
    </div>
  );
}

export function CompactDelta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`num ${positive ? "text-primary" : "text-destructive"}`}>
      {positive ? "+" : "−"}
      {formatCompact(Math.abs(value))} bln ini
    </span>
  );
}
