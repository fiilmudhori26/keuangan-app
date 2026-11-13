import { monthRange } from "../date";
import type { Budget, Category, Transaction, Wallet } from "../types";

export type WalletWithBalance = Wallet & { balance: number };

/** Balance = initial + income − expense + transfer in − transfer out. */
export function computeBalance(initialBalance: number, transactions: Transaction[]): number {
  return transactions.reduce((total, t) => {
    if (t.type === "income") return total + t.amount;
    if (t.type === "expense") return total - t.amount;
    if (t.type === "transfer") {
      return t.transferDirection === "in" ? total + t.amount : total - t.amount;
    }
    return total;
  }, initialBalance);
}

export function withBalances(wallets: Wallet[], transactions: Transaction[]): WalletWithBalance[] {
  return wallets.map((wallet) => ({
    ...wallet,
    balance: computeBalance(
      wallet.initialBalance,
      transactions.filter((t) => t.walletId === wallet.id),
    ),
  }));
}

export function totalBalance(wallets: WalletWithBalance[]): number {
  return wallets.reduce((sum, w) => sum + w.balance, 0);
}

export type Totals = { income: number; expense: number; net: number };

/** Transfers never count as income or expense (PRD §5.2). */
export function monthTotals(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export function spendingByCategory(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.categoryId) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return map;
}

export type BudgetProgress = {
  budget: Budget;
  category: Category | null;
  spent: number;
  remaining: number;
  /** 0..N, may exceed 100 */
  percent: number;
  state: "ok" | "warning" | "over";
};

export function budgetState(percent: number): BudgetProgress["state"] {
  if (percent >= 100) return "over";
  if (percent >= 80) return "warning";
  return "ok";
}

export function buildBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
): BudgetProgress[] {
  const spending = spendingByCategory(transactions);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return budgets
    .map((budget) => {
      const spent = spending.get(budget.categoryId) ?? 0;
      const percent = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
      return {
        budget,
        category: byId.get(budget.categoryId) ?? null,
        spent,
        remaining: budget.limitAmount - spent,
        percent,
        state: budgetState(percent),
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

export type TrendPoint = { date: string; income: number; expense: number };

export function dailyTrend(transactions: Transaction[], month: string): TrendPoint[] {
  const { start, end } = monthRange(month);
  const points = new Map<string, TrendPoint>();
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    if (date < start || date > end) continue;
    points.set(date, { date, income: 0, expense: 0 });
  }
  for (const t of transactions) {
    if (t.occurredAt < start || t.occurredAt > end) continue;
    const point = points.get(t.occurredAt);
    if (!point) continue;
    if (t.type === "income") point.income += t.amount;
    if (t.type === "expense") point.expense += t.amount;
  }
  return Array.from(points.values());
}

export function groupByDate(transactions: Transaction[]): Array<{ date: string; items: Transaction[] }> {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const list = groups.get(t.occurredAt) ?? [];
    list.push(t);
    groups.set(t.occurredAt, list);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }));
}
