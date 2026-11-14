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
  spendingByCategory,
  totalBalance,
  withBalances,
} from "@/lib/services/finance";
import { goalProgress } from "@/lib/services/goals";
import { monthRange, isValidMonthKey, shiftMonth, formatIndonesianLongDate } from "@/lib/date";
import { formatRupiah, formatCompact } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { BalanceToggle } from "@/components/dashboard/balance-toggle";
import { OnboardingWelcome } from "@/components/dashboard/onboarding-welcome";
import { MaskedAmount } from "@/components/ui/hide-balance";
import { QuickAddButton } from "@/components/transactions/transaction-sheet";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TrendChart } from "@/components/charts/trend-chart";
import { CategoryDonut } from "@/components/charts/category-charts";
import { BudgetBar } from "@/components/ui/budget-bar";
import { GoalIconBadge } from "@/components/goals/goal-icon";
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

  const [profile, wallets, categories, allTransactions, monthTransactions, budgets, prevTransactions, goals, contributions] =
    await Promise.all([
      getOrCreateProfile(user.id, user.name),
      repo.listWallets(user.id),
      repo.listCategories(user.id),
      repo.listTransactions(user.id, { limit: 5000 }),
      repo.listTransactions(user.id, { ...monthRange(month), limit: 1000 }),
      repo.listBudgets(user.id, month),
      repo.listTransactions(user.id, { ...monthRange(shiftMonth(month, -1)), limit: 1000 }),
      repo.listGoals(user.id),
      repo.listContributions(user.id),
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
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const spending = spendingByCategory(monthTransactions);
  const spendingSlices = Array.from(spending.entries())
    .map(([categoryId, value]) => ({
      categoryId,
      name: categoryById.get(categoryId)?.name ?? "Tanpa kategori",
      value,
      color: categoryById.get(categoryId)?.color,
    }))
    .sort((a, b) => b.value - a.value);
  const deltaPositive = delta >= 0;
  const displayName = (profile.displayName || user.name).trim();
  const initial = ([...displayName][0] ?? "?").toUpperCase();
  const todayLabel = formatIndonesianLongDate();
  const cashflowTotal = totals.income + totals.expense;
  const incomeShare = cashflowTotal > 0 ? (totals.income / cashflowTotal) * 100 : 50;
  const incomeWidth = Math.min(66, Math.max(34, incomeShare));
  const expenseWidth = 100 - incomeWidth;
  const incomeSharePct = cashflowTotal > 0 ? Math.round((totals.income / cashflowTotal) * 100) : 0;
  const expenseSharePct = cashflowTotal > 0 ? 100 - incomeSharePct : 0;
  const net = totals.net;
  // Kartu mini "Target tabungan": goal aktif dengan progres tertinggi (<100%);
  // bila semua tercapai, tampilkan yang terakhir dibuat.
  const goalItems = goals.map((goal) => ({ goal, ...goalProgress(goal, contributions) }));
  const activeGoals = goalItems.filter((item) => item.percent < 100);
  const topGoal =
    activeGoals.length > 0
      ? activeGoals.reduce((best, item) => (item.percent > best.percent ? item : best))
      : goalItems.length > 0
        ? goalItems[goalItems.length - 1]
        : null;
  const topGoalReached = topGoal?.state === "reached";

  return (
    <div className="animate-fade-up-fast space-y-6">
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
            <p className="text-[13px] font-semibold leading-[18px] text-primary">Keuangan</p>
            <h1 className="truncate text-[18px] font-semibold leading-6 text-foreground">
              Halo, {displayName}
            </h1>
            <p className="text-[13px] font-medium leading-[18px] text-muted-foreground">{todayLabel}</p>
            <MonthSwitcher month={month} basePath="/dashboard" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QuickAddButton wallets={wallets} categories={categories} label="Catat" />
          <BalanceToggle />
          <Link
            href="/settings"
            aria-label="Pengaturan"
            className="flex size-11 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
          >
            <Settings2 className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <OnboardingWelcome
        hasWallet={wallets.length > 0}
        hasTransaction={allTransactions.length > 0}
      />

      <Panel className="relative rounded-[20px] border-transparent bg-primary p-6 text-primary-foreground">
        <span
          aria-hidden
          className="hero-scrim absolute right-6 top-6 flex size-16 items-center justify-center rounded-full text-[24px] font-bold leading-none text-primary-foreground"
        >
          {initial}
        </span>
        <div className="flex items-center justify-between gap-3 pr-20">
          <p className="text-[13px] font-medium leading-[18px] text-primary-foreground">
            Saldo total
          </p>
          <span
            role="img"
            className={cn(
              "hero-scrim inline-flex items-center gap-1 rounded-[10px] px-2 py-1 text-[14px] leading-[20px] font-semibold text-primary-foreground",
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
        <MaskedAmount className="mt-1 block text-[44px] font-bold leading-[48px] tracking-display text-primary-foreground">
          <CountUp
            value={totalBalance(walletBalances)}
            className="num text-primary-foreground"
          />
        </MaskedAmount>
        <TrendChart data={trend} onBrand />
      </Panel>

      <Panel className="rounded-hero p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">Cash flow bulan ini</p>
          <MaskedAmount
            className={cn(
              "num text-[13px] font-semibold",
              net >= 0 ? "text-primary" : "text-destructive",
            )}
          >
            {net >= 0 ? "+" : "−"}
            {formatCompact(Math.abs(net))}
          </MaskedAmount>
        </div>
        <div className="mt-3 flex h-16 w-full gap-[2px] overflow-hidden rounded-[10px]">
          <Link
            href="/transactions?type=income"
            aria-label="Masuk — lihat transaksi pemasukan"
            className="animate-bar flex min-w-0 flex-col justify-center gap-0.5 bg-primary px-3 text-primary-foreground transition-[width] duration-[420ms] ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground"
            style={{ width: `${incomeWidth}%`, animationDuration: "420ms" }}
          >
            <span className="flex items-baseline justify-between gap-2 text-[12px] font-medium leading-4 text-primary-foreground">
              Masuk
              <span className="num">{incomeSharePct}%</span>
            </span>
            <MaskedAmount className="block truncate text-[13px] font-semibold leading-[18px] text-primary-foreground">
              {formatRupiah(totals.income)}
            </MaskedAmount>
          </Link>
          <Link
            href="/transactions?type=expense"
            aria-label="Keluar — lihat transaksi pengeluaran"
            className="animate-bar flex min-w-0 flex-col justify-center gap-0.5 bg-destructive px-3 text-primary-foreground transition-[width] duration-[420ms] ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground"
            style={{ width: `${expenseWidth}%`, animationDuration: "420ms" }}
          >
            <span className="flex items-baseline justify-between gap-2 text-[12px] font-medium leading-4 text-primary-foreground">
              Keluar
              <span className="num">{expenseSharePct}%</span>
            </span>
            <MaskedAmount className="block truncate text-[13px] font-semibold leading-[18px] text-primary-foreground">
              {formatRupiah(totals.expense)}
            </MaskedAmount>
          </Link>
        </div>
      </Panel>

      {topGoal ? (
        <section>
          <SectionHeader
            title="Target tabungan"
            action={
              <Link href="/goals" className="flex h-11 items-center text-[14px] font-semibold text-primary">
                Lihat
              </Link>
            }
          />
          <Panel className="flex items-center gap-3 p-4">
            <GoalIconBadge icon={topGoal.goal.icon} color={topGoal.goal.color} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-5 text-foreground">
                {topGoal.goal.name}
              </p>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-border"
                role="img"
                aria-label={`Progres target tabungan ${topGoal.goal.name}: ${Math.round(topGoal.percent)}%`}
              >
                <div
                  className={cn(
                    "animate-bar h-full rounded-full transition-[width] duration-[var(--motion-base)] ease-out",
                    topGoalReached ? "bg-gold" : "bg-primary",
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, topGoal.percent))}%` }}
                />
              </div>
              <p className="mt-1.5 text-[13px] leading-[18px] text-muted-foreground">
                {topGoalReached ? (
                  <span className="font-medium text-gold-text">Tercapai</span>
                ) : (
                  <>
                    Sisa{" "}
                    <MaskedAmount className="num font-medium text-foreground">
                      {formatRupiah(Math.max(0, topGoal.goal.targetAmount - topGoal.saved))}
                    </MaskedAmount>
                  </>
                )}{" "}
                dari target{" "}
                <MaskedAmount className="num">
                  {formatRupiah(topGoal.goal.targetAmount)}
                </MaskedAmount>{" "}
                · <span className="num font-medium text-foreground">{Math.round(topGoal.percent)}%</span>
              </p>
            </div>
          </Panel>
        </section>
      ) : null}

      {totals.expense > 0 ? (
        <section>
          <SectionHeader title="Pengeluaran bulan ini" />
          <Panel>
            <CategoryDonut compact data={spendingSlices} total={totals.expense} />
          </Panel>
        </section>
      ) : null}

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
                  <MaskedAmount className="text-muted-foreground">
                    {formatRupiah(item.spent)}
                  </MaskedAmount>
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
