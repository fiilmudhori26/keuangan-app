import Link from "next/link";
import { ChevronRight, Settings2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { isDemoMode } from "@/lib/db";
import { currentMonth, getOrCreateProfile } from "@/lib/services/queries";
import {
  buildBudgetProgress,
  dailyTrend,
  monthTotals,
  totalBalance,
  withBalances,
} from "@/lib/services/finance";
import { monthRange, isValidMonthKey, shiftMonth } from "@/lib/date";
import { formatRupiah } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { QuickAddButton } from "@/components/transactions/transaction-sheet";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TrendChart, CompactDelta } from "@/components/charts/trend-chart";
import { BudgetBar } from "@/components/ui/budget-bar";
import { CountUp } from "@/components/ui/count-up";
import { Panel, SectionHeader } from "@/components/ui/panel";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const month =
    params.month && isValidMonthKey(params.month) ? params.month : currentMonth();

  const [profile, wallets, categories, allTransactions, monthTransactions, budgets, prevTransactions] =
    await Promise.all([
      getOrCreateProfile(user.id, user.name),
      repo.listWallets(user.id),
      repo.listCategories(user.id),
      repo.listTransactions(user.id, { limit: 5000 }),
      repo.listTransactions(user.id, { ...monthRange(month), limit: 1000 }),
      repo.listBudgets(user.id, month),
      repo.listTransactions(user.id, { ...monthRange(shiftMonth(month, -1)), limit: 1000 }),
    ]);

  const walletBalances = withBalances(wallets, allTransactions);
  const totals = monthTotals(monthTransactions);
  const prevTotals = monthTotals(prevTransactions);
  const progress = buildBudgetProgress(budgets, monthTransactions, categories);
  const trend = dailyTrend(monthTransactions, month).reduce<Array<{ date: string; value: number }>>(
    (acc, point) => {
      const previous = acc.length > 0 ? acc[acc.length - 1].value : 0;
      acc.push({ date: point.date, value: previous + point.income - point.expense });
      return acc;
    },
    [],
  );
  const delta = totals.net - prevTotals.net;

  return (
    <div className="space-y-5">
      {isDemoMode ? (
        <p className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo: data disimpan di memori server. Isi <code>DATABASE_URL</code> untuk memakai Neon.
        </p>
      ) : null}

      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[13px] text-muted-foreground">Halo, {profile.displayName || user.name}</p>
          <MonthSwitcher month={month} basePath="/dashboard" />
        </div>
        <div className="flex items-center gap-2">
          <QuickAddButton wallets={wallets} categories={categories} label="Catat" />
          <Link
            href="/settings"
            aria-label="Pengaturan"
            className="flex size-11 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
          >
            <Settings2 className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <Panel className="rounded-[20px] p-5">
        <p className="text-[13px] font-medium text-muted-foreground">Saldo total</p>
        <CountUp
          value={totalBalance(walletBalances)}
          className="num mt-1 text-[40px] font-bold leading-[44px] text-foreground"
        />
        <TrendChart data={trend} />
        <p className="mt-1 text-[13px] text-muted-foreground">
          <CompactDelta value={delta} />
        </p>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Panel className="p-4">
          <p className="text-[13px] text-muted-foreground">Masuk</p>
          <p className="num mt-1 text-[18px] font-semibold text-primary">
            +{formatRupiah(totals.income)}
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[13px] text-muted-foreground">Keluar</p>
          <p className="num mt-1 text-[18px] font-semibold text-foreground">
            −{formatRupiah(totals.expense)}
          </p>
        </Panel>
      </div>

      <section>
        <SectionHeader
          title="Anggaran"
          action={
            <Link href="/budgets" className="flex h-11 items-center text-[14px] font-semibold text-primary">
              Lihat
            </Link>
          }
        />
        {progress.length === 0 ? (
          <Panel>
            <p className="text-[14px] text-muted-foreground">
              Belum ada anggaran bulan ini.{" "}
              <Link href="/budgets" className="font-semibold text-primary">
                Atur anggaran
              </Link>
            </p>
          </Panel>
        ) : (
          <Panel className="space-y-4">
            {progress.slice(0, 3).map((item) => (
              <div key={item.budget.id}>
                <div className="mb-1 flex items-center justify-between text-[14px]">
                  <span className="font-medium text-foreground">
                    {item.category?.name ?? "Tanpa kategori"}
                  </span>
                  <span className="num text-muted-foreground">
                    {formatRupiah(item.spent)}
                  </span>
                </div>
                <BudgetBar percent={item.percent} state={item.state} />
              </div>
            ))}
          </Panel>
        )}
      </section>

      <section>
        <SectionHeader
          title="Transaksi terbaru"
          action={
            <Link href="/transactions" className="flex h-11 items-center text-[14px] font-semibold text-primary">
              Lihat
            </Link>
          }
        />
        <TransactionList
          transactions={monthTransactions.slice(0, 6)}
          wallets={wallets}
          categories={categories}
        />
      </section>

      <Link
        href="/reports"
        className="flex h-12 items-center justify-between rounded-[14px] border border-border bg-card px-4 text-[15px] font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted"
      >
        Laporan bulanan
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
