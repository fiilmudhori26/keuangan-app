import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Settings2, Target } from "lucide-react";
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
import { formatRupiah, formatCompact } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { QuickAddButton } from "@/components/transactions/transaction-sheet";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TrendChart } from "@/components/charts/trend-chart";
import { BudgetBar } from "@/components/ui/budget-bar";
import { CountUp } from "@/components/ui/count-up";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
  const deltaPositive = delta >= 0;
  const displayName = (profile.displayName || user.name).trim();
  const initial = ([...displayName][0] ?? "?").toUpperCase();
  const incomeDeltaPct =
    prevTotals.income > 0 ? ((totals.income - prevTotals.income) / prevTotals.income) * 100 : null;
  const expenseDeltaPct =
    prevTotals.expense > 0
      ? ((totals.expense - prevTotals.expense) / prevTotals.expense) * 100
      : null;

  return (
    <div className="space-y-6">
      {isDemoMode ? (
        <p className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo: data disimpan di memori server. Isi <code>DATABASE_URL</code> untuk memakai Neon.
        </p>
      ) : null}

      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[16px] font-semibold text-primary"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] text-muted-foreground">Halo, {displayName}</p>
            <MonthSwitcher month={month} basePath="/dashboard" />
          </div>
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

      <Panel className="rounded-[20px] border-border bg-surface-raised p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">Saldo total</p>
          <span
            role="img"
            className={cn(
              "inline-flex items-center gap-1 rounded-[10px] px-2 py-1 text-[14px] leading-[20px] font-semibold",
              deltaPositive ? "bg-secondary text-primary" : "bg-expense-soft text-expense-text",
            )}
            aria-label={`Selisih bulan ini dibanding bulan lalu: ${deltaPositive ? "plus" : "minus"} ${formatCompact(Math.abs(delta))}`}
          >
            {deltaPositive ? (
              <ArrowUpRight className="size-3.5" aria-hidden />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden />
            )}
            <span className="num">
              {deltaPositive ? "+" : "−"}
              {formatCompact(Math.abs(delta))}
            </span>
          </span>
        </div>
        <CountUp
          value={totalBalance(walletBalances)}
          className="num mt-1 text-[44px] font-bold leading-[48px] tracking-display text-foreground"
        />
        <TrendChart data={trend} />
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Panel className="p-4">
          <p className="text-[13px] text-muted-foreground">Masuk</p>
          <p className="num mt-1 text-[18px] font-semibold text-primary">
            +{formatRupiah(totals.income)}
          </p>
          {incomeDeltaPct !== null && Math.abs(Math.round(incomeDeltaPct)) !== 0 ? (
            <p
              className={cn(
                "num mt-1 text-[12px] font-semibold",
                incomeDeltaPct >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {incomeDeltaPct >= 0 ? "+" : "−"}
              {Math.abs(Math.round(incomeDeltaPct))}% vs bln lalu
            </p>
          ) : null}
        </Panel>
        <Panel className="p-4">
          <p className="text-[13px] text-muted-foreground">Keluar</p>
          <p className="num mt-1 text-[18px] font-semibold text-foreground">
            −{formatRupiah(totals.expense)}
          </p>
          {expenseDeltaPct !== null && Math.abs(Math.round(expenseDeltaPct)) !== 0 ? (
            <p
              className={cn(
                "num mt-1 text-[12px] font-semibold",
                expenseDeltaPct <= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {expenseDeltaPct >= 0 ? "+" : "−"}
              {Math.abs(Math.round(expenseDeltaPct))}% vs bln lalu
            </p>
          ) : null}
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
          <EmptyState
            icon={Target}
            message="Belum ada anggaran bulan ini."
            actionLabel="Atur anggaran"
            actionHref="/budgets"
          />
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
        className="flex h-12 items-center justify-between rounded-[14px] border border-border bg-card px-4 text-[16px] font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted"
      >
        Laporan bulanan
        <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
