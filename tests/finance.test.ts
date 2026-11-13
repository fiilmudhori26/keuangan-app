import { describe, expect, it } from "vitest";
import { computeBalance, budgetState, buildBudgetProgress, monthTotals, dailyTrend, withBalances } from "@/lib/services/finance";
import type { Budget, Category, Transaction, Wallet } from "@/lib/types";

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: Math.random().toString(36),
    userId: "u1",
    walletId: "w1",
    categoryId: "c1",
    type: "expense",
    transferDirection: null,
    amount: 1000,
    occurredAt: "2026-11-10",
    note: null,
    merchant: null,
    receiptPath: null,
    transferGroupId: null,
    source: "manual",
    createdAt: "2026-11-10T00:00:00.000Z",
    updatedAt: "2026-11-10T00:00:00.000Z",
    ...partial,
  };
}

const wallet: Wallet = {
  id: "w1",
  userId: "u1",
  name: "Tunai",
  type: "cash",
  initialBalance: 100_000,
  color: "#0B7A4B",
  icon: "Wallet",
  isArchived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const category: Category = {
  id: "c1",
  userId: "u1",
  name: "Makan",
  type: "expense",
  icon: "Utensils",
  color: "#0B7A4B",
  isArchived: false,
};

describe("balances", () => {
  it("adds income, subtracts expense, and applies transfer direction", () => {
    const transactions = [
      tx({ type: "income", amount: 5000 }),
      tx({ type: "expense", amount: 2000 }),
      tx({ type: "transfer", transferDirection: "in", amount: 700 }),
      tx({ type: "transfer", transferDirection: "out", amount: 300 }),
    ];
    expect(computeBalance(100_000, transactions)).toBe(103_400);
  });

  it("keeps per-wallet balances separate", () => {
    const second: Wallet = { ...wallet, id: "w2", name: "BCA" };
    const result = withBalances(
      [wallet, second],
      [tx({ walletId: "w1", type: "expense", amount: 25_000 })],
    );
    expect(result[0].balance).toBe(75_000);
    expect(result[1].balance).toBe(100_000);
  });
});

describe("month totals", () => {
  it("never counts transfers as income or expense", () => {
    const totals = monthTotals([
      tx({ type: "income", amount: 1_000_000 }),
      tx({ type: "expense", amount: 250_000 }),
      tx({ type: "transfer", transferDirection: "out", amount: 400_000 }),
      tx({ type: "transfer", transferDirection: "in", amount: 400_000 }),
    ]);
    expect(totals).toEqual({ income: 1_000_000, expense: 250_000, net: 750_000 });
  });
});

describe("budget progress", () => {
  const budget: Budget = {
    id: "b1",
    userId: "u1",
    categoryId: "c1",
    month: "2026-11",
    limitAmount: 1_000_000,
  };

  it("classifies thresholds at 80% and 100%", () => {
    expect(budgetState(79.9)).toBe("ok");
    expect(budgetState(80)).toBe("warning");
    expect(budgetState(100)).toBe("over");
  });

  it("computes spending against the limit and ignores other categories", () => {
    const [progress] = buildBudgetProgress(
      [budget],
      [
        tx({ amount: 820_000 }),
        tx({ amount: 100_000, categoryId: "c2" }),
        tx({ type: "income", amount: 2_000_000 }),
      ],
      [category],
    );
    expect(progress.spent).toBe(820_000);
    expect(progress.percent).toBeCloseTo(82);
    expect(progress.state).toBe("warning");
    expect(progress.remaining).toBe(180_000);
  });
});

describe("daily trend", () => {
  it("covers every day of the month", () => {
    const trend = dailyTrend([tx({ occurredAt: "2026-11-02", amount: 5000 })], "2026-11");
    expect(trend).toHaveLength(30);
    expect(trend[1]).toEqual({ date: "2026-11-02", income: 0, expense: 5000 });
  });
});
