import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { currentMonth } from "@/lib/services/queries";
import { buildBudgetProgress, monthTotals } from "@/lib/services/finance";
import { formatRupiah } from "@/lib/money";
import { isValidMonthKey, monthRange } from "@/lib/date";
import { MonthSwitcher } from "@/components/month-switcher";
import { BudgetManager } from "@/components/budgets/budget-manager";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const month = params.month && isValidMonthKey(params.month) ? params.month : currentMonth();

  const [categories, budgets, transactions] = await Promise.all([
    repo.listCategories(user.id),
    repo.listBudgets(user.id, month),
    repo.listTransactions(user.id, { ...monthRange(month), limit: 1000 }),
  ]);

  const progress = buildBudgetProgress(budgets, transactions, categories);
  const totals = monthTotals(transactions);
  const budgeted = budgets.reduce((sum, budget) => sum + budget.limitAmount, 0);

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[24px] font-bold leading-[30px] tracking-display text-foreground">Anggaran</h1>
          <p className="text-[13px] text-muted-foreground">Pantau batas pengeluaran per kategori.</p>
        </div>
        <MonthSwitcher month={month} basePath="/budgets" />
      </header>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[14px] border border-border bg-card p-3">
          <p className="text-[12px] text-muted-foreground">Anggaran</p>
          <p className="num mt-1 text-[14px] font-semibold text-foreground">{formatRupiah(budgeted)}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-card p-3">
          <p className="text-[12px] text-muted-foreground">Terpakai</p>
          <p className="num mt-1 text-[14px] font-semibold text-foreground">{formatRupiah(totals.expense)}</p>
        </div>
        <div className="rounded-[14px] border border-border bg-card p-3">
          <p className="text-[12px] text-muted-foreground">Sisa</p>
          <p className="num mt-1 text-[14px] font-semibold text-foreground">
            {formatRupiah(budgeted - totals.expense)}
          </p>
        </div>
      </div>

      <BudgetManager month={month} progress={progress} categories={categories} />
    </div>
  );
}
