import Link from "next/link";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { currentMonth } from "@/lib/services/queries";
import { dailyTrend, groupByDate, monthTotals, spendingByCategory } from "@/lib/services/finance";
import { isValidMonthKey, monthRange, shiftMonth } from "@/lib/date";
import { formatRupiah } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { CategoryDonut, MonthComparison } from "@/components/charts/category-charts";
import { Panel, SectionHeader } from "@/components/ui/panel";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const month = params.month && isValidMonthKey(params.month) ? params.month : currentMonth();
  const previous = shiftMonth(month, -1);

  const [categories, transactions, prevTransactions] = await Promise.all([
    repo.listCategories(user.id, true),
    repo.listTransactions(user.id, { ...monthRange(month), limit: 1000 }),
    repo.listTransactions(user.id, { ...monthRange(previous), limit: 1000 }),
  ]);

  const totals = monthTotals(transactions);
  const prevTotals = monthTotals(prevTransactions);
  const spending = spendingByCategory(transactions);
  const prevSpending = spendingByCategory(prevTransactions);
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const slices = Array.from(spending.entries())
    .map(([categoryId, value]) => ({
      name: categoryById.get(categoryId)?.name ?? "Tanpa kategori",
      value,
      color: categoryById.get(categoryId)?.color,
    }))
    .sort((a, b) => b.value - a.value);

  const comparison = Array.from(new Set([...spending.keys(), ...prevSpending.keys()]))
    .map((categoryId) => ({
      name: categoryById.get(categoryId)?.name ?? "Tanpa kategori",
      current: spending.get(categoryId) ?? 0,
      previous: prevSpending.get(categoryId) ?? 0,
    }))
    .sort((a, b) => b.current - a.current)
    .slice(0, 8);

  const trend = dailyTrend(transactions, month);
  const daysWithSpending = groupByDate(transactions).length;
  const avgPerDay = daysWithSpending > 0 ? Math.round(totals.expense / daysWithSpending) : 0;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[24px] font-bold leading-[30px] text-foreground">Laporan</h1>
          <p className="text-[13px] text-muted-foreground">Ringkasan dan perbandingan bulan.</p>
        </div>
        <MonthSwitcher month={month} basePath="/reports" />
      </header>

      <Panel className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[12px] text-muted-foreground">Masuk</p>
            <p className="num mt-1 text-[14px] font-semibold text-primary">{formatRupiah(totals.income)}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Keluar</p>
            <p className="num mt-1 text-[14px] font-semibold text-foreground">
              {formatRupiah(totals.expense)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Selisih</p>
            <p
              className={`num mt-1 text-[14px] font-semibold ${totals.net >= 0 ? "text-primary" : "text-destructive"}`}
            >
              {formatRupiah(totals.net)}
            </p>
          </div>
        </div>
        <p className="border-t border-border pt-3 text-[13px] text-muted-foreground">
          Bulan lalu: masuk {formatRupiah(prevTotals.income)}, keluar {formatRupiah(prevTotals.expense)}.
          Rata-rata pengeluaran {formatRupiah(avgPerDay)} per hari aktif.
        </p>
        <Link
          href={`/api/export?month=${month}`}
          className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-border text-[15px] font-semibold text-foreground"
        >
          <Download className="size-4" aria-hidden /> Ekspor CSV
        </Link>
      </Panel>

      <section>
        <SectionHeader title="Pengeluaran per kategori" />
        <Panel>
          <CategoryDonut data={slices} total={totals.expense} />
        </Panel>
      </section>

      <section>
        <SectionHeader title="Bulan ini vs bulan lalu" />
        <Panel>
          <MonthComparison data={comparison} />
        </Panel>
      </section>

      {trend.some((point) => point.expense > 0) ? (
        <section>
          <SectionHeader title="Pengeluaran harian" />
          <Panel>
            <ul className="space-y-2">
              {trend
                .filter((point) => point.expense > 0)
                .slice(-10)
                .map((point) => (
                  <li key={point.date} className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">{point.date}</span>
                    <span className="num text-foreground">{formatRupiah(point.expense)}</span>
                  </li>
                ))}
            </ul>
          </Panel>
        </section>
      ) : null}
    </div>
  );
}
