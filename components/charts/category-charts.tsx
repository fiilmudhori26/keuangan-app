"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatRupiah } from "@/lib/money";

export const CHART_COLORS = [
  "#0B7A4B",
  "#2F6FDE",
  "#C98A0B",
  "#7C5CD6",
  "#0E9AA7",
  "#D6457A",
  "#64748B",
  "#E0622D",
];

export type CategorySlice = { name: string; value: number; color?: string; categoryId?: string };

export function CategoryDonut({
  data,
  total,
  compact = false,
}: {
  data: CategorySlice[];
  total: number;
  /** Donut 96 px + legend 5 teratas (persen saja, tanpa nominal) untuk dashboard. */
  compact?: boolean;
}) {
  const slices = data.slice(0, 8);
  if (slices.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Belum ada pengeluaran bulan ini.</p>;
  }
  if (compact) {
    const top = slices.slice(0, 5);
    return (
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius={30}
                outerRadius={46}
                paddingAngle={2}
                strokeWidth={0}
              >
                {slices.map((slice, index) => (
                  <Cell
                    key={slice.categoryId ?? index}
                    fill={slice.color ?? CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-1">
          {top.map((slice, index) => (
            <li key={slice.categoryId ?? index} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: slice.color ?? CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="truncate text-foreground">{slice.name}</span>
              </span>
              <span className="num shrink-0 text-muted-foreground">
                {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
        <p className="sr-only">
          Pengeluaran per kategori bulan ini:{" "}
          {slices.map((s) => `${s.name} ${formatRupiah(s.value)}`).join(", ")}.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((slice, index) => (
                <Cell key={slice.categoryId ?? index} fill={slice.color ?? CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                return (
                  <div className="rounded-[10px] border border-border bg-popover px-2 py-1 text-[12px] text-popover-foreground">
                    {item.name} · <span className="num">{formatRupiah(Number(item.value))}</span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[12px] text-muted-foreground">Total</span>
          <span className="num text-[13px] font-semibold text-foreground">{formatRupiah(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {slices.map((slice, index) => (
          <li key={slice.categoryId ?? index} className="flex items-center justify-between gap-2 text-[13px]">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color ?? CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate text-foreground">{slice.name}</span>
            </span>
            <span className="num shrink-0 text-muted-foreground">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only">
        Pengeluaran per kategori: {slices.map((s) => `${s.name} ${formatRupiah(s.value)}`).join(", ")}.
      </p>
    </div>
  );
}

export function MonthComparison({
  data,
}: {
  data: Array<{ name: string; current: number; previous: number }>;
}) {
  if (data.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Belum ada data untuk dibandingkan.</p>;
  }
  return (
    <div>
      <div className="mb-2 flex gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-primary" /> Bulan ini
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-[#64748B]" /> Bulan lalu
        </span>
      </div>
      <div className="h-52" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Bar dataKey="current" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" fill="#64748B" radius={[4, 4, 0, 0]} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as { name: string; current: number; previous: number };
                return (
                  <div className="rounded-[10px] border border-border bg-popover px-2 py-1 text-[12px] text-popover-foreground">
                    <p className="font-semibold">{point.name}</p>
                    <p>
                      Bulan ini: <span className="num">{formatRupiah(point.current)}</span>
                    </p>
                    <p>
                      Bulan lalu: <span className="num">{formatRupiah(point.previous)}</span>
                    </p>
                  </div>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Perbandingan pengeluaran per kategori</caption>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Bulan ini</th>
            <th>Bulan lalu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td className="num">{formatRupiah(row.current)}</td>
              <td className="num">{formatRupiah(row.previous)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
