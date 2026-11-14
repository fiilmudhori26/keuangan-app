import { beforeEach, describe, expect, it } from "vitest";
import { resetStoreForTests } from "@/lib/demo/store";
import { repo } from "@/lib/data/repo.demo";

/**
 * Data isolation (PRD §8): every repository call receives userId from the
 * session and must never expose another user's rows.
 */
describe("repository isolation", () => {
  const alice = "user-alice";
  const bob = "user-bob";

  beforeEach(() => {
    resetStoreForTests();
  });

  it("does not leak wallets between users", async () => {
    const wallet = await repo.createWallet(alice, {
      name: "Dompet Alice",
      type: "cash",
      initialBalance: 10_000,
      color: "#0B7A4B",
      icon: "Wallet",
      isArchived: false,
    });

    expect(await repo.getWallet(bob, wallet.id)).toBeNull();
    expect(await repo.listWallets(bob)).toHaveLength(0);
    expect(await repo.updateWallet(bob, wallet.id, { name: "Dibajak" })).toBeNull();
    expect((await repo.getWallet(alice, wallet.id))?.name).toBe("Dompet Alice");
  });

  it("does not leak transactions between users", async () => {
    const wallet = await repo.createWallet(alice, {
      name: "Dompet Alice",
      type: "cash",
      initialBalance: 0,
      color: "#0B7A4B",
      icon: "Wallet",
      isArchived: false,
    });
    const category = await repo.createCategory(alice, {
      name: "Makan",
      type: "expense",
      icon: "Utensils",
      color: "#0B7A4B",
      isArchived: false,
    });
    const transaction = await repo.createTransaction(alice, {
      walletId: wallet.id,
      categoryId: category.id,
      type: "expense",
      transferDirection: null,
      amount: 20_000,
      occurredAt: "2026-11-13",
      note: "rahasia",
      merchant: null,
      receiptPath: null,
      transferGroupId: null,
      source: "manual",
    });

    expect(await repo.getTransaction(bob, transaction.id)).toBeNull();
    expect(await repo.listTransactions(bob)).toHaveLength(0);
    expect(await repo.deleteTransaction(bob, transaction.id)).toBe(false);
    expect((await repo.getTransaction(alice, transaction.id))?.note).toBe("rahasia");
  });

  it("archives budgets per user without affecting the other", async () => {
    const category = await repo.createCategory(alice, {
      name: "Makan",
      type: "expense",
      icon: "Utensils",
      color: "#0B7A4B",
      isArchived: false,
    });
    const budget = await repo.upsertBudget(alice, {
      categoryId: category.id,
      month: "2026-11",
      limitAmount: 1_000_000,
    });
    expect(await repo.listBudgets(bob, "2026-11")).toHaveLength(0);
    expect(await repo.deleteBudget(bob, budget.id)).toBe(false);
    expect(await repo.listBudgets(alice, "2026-11")).toHaveLength(1);
  });
});

describe("savings goals isolation", () => {
  const alice = "user-alice";
  const bob = "user-bob";

  beforeEach(() => {
    resetStoreForTests();
  });

  it("does not leak goals between users", async () => {
    const goal = await repo.createGoal(alice, {
      name: "Dana darurat Alice",
      targetAmount: 10_000_000,
      icon: "PiggyBank",
      color: "#0B7A4B",
    });

    expect(await repo.listGoals(bob)).toHaveLength(0);
    // Repo tidak mengekspos getContributions per goal; jalur "null" terdekat:
    // Bob tidak bisa menyetor ke goal milik Alice.
    expect(
      await repo.addContribution(bob, {
        goalId: goal.id,
        amount: 100_000,
        occurredAt: "2026-11-13",
      }),
    ).toBeNull();
    expect(await repo.deleteGoal(bob, goal.id)).toBe(false);
    await repo.deleteUserData(bob);
    expect((await repo.listGoals(alice)).map((item) => item.id)).toContain(goal.id);
  });

  it("does not leak contributions between users", async () => {
    const goal = await repo.createGoal(alice, {
      name: "Dana liburan Alice",
      targetAmount: 5_000_000,
      icon: "Target",
      color: "#0B7A4B",
    });
    await repo.addContribution(alice, {
      goalId: goal.id,
      amount: 500_000,
      occurredAt: "2026-11-13",
    });

    expect(await repo.listContributions(bob)).toHaveLength(0);
    expect(await repo.listContributions(alice)).toHaveLength(1);
  });

  it("deleting a goal also deletes its contributions", async () => {
    const goal = await repo.createGoal(alice, {
      name: "Dana pendidikan Alice",
      targetAmount: 20_000_000,
      icon: "GraduationCap",
      color: "#0B7A4B",
    });
    await repo.addContribution(alice, {
      goalId: goal.id,
      amount: 1_000_000,
      occurredAt: "2026-11-01",
    });
    await repo.addContribution(alice, {
      goalId: goal.id,
      amount: 250_000,
      occurredAt: "2026-11-13",
    });
    expect(await repo.listContributions(alice)).toHaveLength(2);

    expect(await repo.deleteGoal(alice, goal.id)).toBe(true);
    expect(await repo.listGoals(alice)).toHaveLength(0);
    expect(await repo.listContributions(alice)).toHaveLength(0);
  });

  it("scopes goal operations to the owner's userId", async () => {
    const goal = await repo.createGoal(alice, {
      name: "Rumah Alice",
      targetAmount: 500_000_000,
      icon: "Home",
      color: "#0B7A4B",
    });

    // Bob knows the goal id but it is not his.
    expect(await repo.deleteGoal(bob, goal.id)).toBe(false);
    expect(await repo.listGoals(bob)).toHaveLength(0);
    expect(await repo.addContribution(bob, {
      goalId: goal.id,
      amount: 100_000,
      occurredAt: "2026-11-13",
    })).toBeNull();
    expect(await repo.listContributions(bob)).toHaveLength(0);
    expect(await repo.listGoals(alice)).toHaveLength(1);
  });
});

describe("transfers", () => {
  const user = "user-transfer";

  beforeEach(() => {
    resetStoreForTests();
  });

  it("creates a pair and deletes both rows together", async () => {
    const from = await repo.createWallet(user, {
      name: "BCA",
      type: "bank",
      initialBalance: 1_000_000,
      color: "#2F6FDE",
      icon: "Landmark",
      isArchived: false,
    });
    const to = await repo.createWallet(user, {
      name: "GoPay",
      type: "ewallet",
      initialBalance: 0,
      color: "#0E9AA7",
      icon: "Smartphone",
      isArchived: false,
    });

    await repo.createTransfer(user, {
      fromWalletId: from.id,
      toWalletId: to.id,
      amount: 250_000,
      occurredAt: "2026-11-13",
      note: "Isi saldo",
    });

    const transactions = await repo.listTransactions(user);
    expect(transactions).toHaveLength(2);
    expect(transactions.every((item) => item.type === "transfer")).toBe(true);

    await repo.deleteTransaction(user, transactions[0].id);
    expect(await repo.listTransactions(user)).toHaveLength(0);
  });
});
