import { uid } from "../utils";
import { getStore } from "../demo/store";
import { isDemoMode } from "../db";
import { drizzleRepo } from "./repo.drizzle";
import type { Budget, Category, Profile, Transaction, Wallet } from "../types";
import type { Repo } from "./types";

const demoRepo: Repo = {
  async getProfile(userId) {
    return getStore().profiles.find((p) => p.userId === userId) ?? null;
  },

  async saveProfile(userId, patch) {
    const store = getStore();
    const existing = store.profiles.find((p) => p.userId === userId);
    if (!existing) {
      const created: Profile = {
        userId,
        displayName: patch.displayName ?? "",
        currency: patch.currency ?? "IDR",
        monthStartDay: patch.monthStartDay ?? 1,
        theme: patch.theme ?? "system",
      };
      store.profiles.push(created);
      return created;
    }
    Object.assign(existing, patch);
    return existing;
  },

  async deleteUserData(userId) {
    const store = getStore();
    store.wallets = store.wallets.filter((w) => w.userId !== userId);
    store.categories = store.categories.filter((c) => c.userId !== userId);
    store.transactions = store.transactions.filter((t) => t.userId !== userId);
    store.budgets = store.budgets.filter((b) => b.userId !== userId);
    store.profiles = store.profiles.filter((p) => p.userId !== userId);
  },

  async listWallets(userId, includeArchived = false) {
    return getStore()
      .wallets.filter((w) => w.userId === userId && (includeArchived || !w.isArchived))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async getWallet(userId, id) {
    return getStore().wallets.find((w) => w.userId === userId && w.id === id) ?? null;
  },

  async createWallet(userId, input) {
    const wallet: Wallet = {
      ...input,
      id: uid("wallet"),
      userId,
      createdAt: new Date().toISOString(),
    };
    getStore().wallets.push(wallet);
    return wallet;
  },

  async updateWallet(userId, id, patch) {
    const wallet = getStore().wallets.find((w) => w.userId === userId && w.id === id);
    if (!wallet) return null;
    Object.assign(wallet, patch);
    return wallet;
  },

  async listCategories(userId, includeArchived = false) {
    return getStore().categories.filter(
      (c) => c.userId === userId && (includeArchived || !c.isArchived),
    );
  },

  async getCategory(userId, id) {
    return getStore().categories.find((c) => c.userId === userId && c.id === id) ?? null;
  },

  async createCategory(userId, input) {
    const category: Category = { ...input, id: uid("cat"), userId };
    getStore().categories.push(category);
    return category;
  },

  async updateCategory(userId, id, patch) {
    const category = getStore().categories.find((c) => c.userId === userId && c.id === id);
    if (!category) return null;
    Object.assign(category, patch);
    return category;
  },

  async listTransactions(userId, filter = {}) {
    const search = filter.search?.toLowerCase().trim();
    return getStore()
      .transactions.filter((t) => {
        if (t.userId !== userId) return false;
        if (filter.from && t.occurredAt < filter.from) return false;
        if (filter.to && t.occurredAt > filter.to) return false;
        if (filter.walletId && t.walletId !== filter.walletId) return false;
        if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
        if (filter.type && t.type !== filter.type) return false;
        if (search) {
          const haystack = `${t.note ?? ""} ${t.merchant ?? ""}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const byDate = b.occurredAt.localeCompare(a.occurredAt);
        return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, filter.limit ?? 500);
  },

  async getTransaction(userId, id) {
    return (
      getStore().transactions.find((t) => t.userId === userId && t.id === id) ?? null
    );
  },

  async createTransaction(userId, input) {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...input,
      id: uid("trx"),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    getStore().transactions.push(transaction);
    return transaction;
  },

  async createTransfer(userId, input) {
    const groupId = uid("transfer");
    const now = new Date().toISOString();
    const base = {
      userId,
      categoryId: null,
      type: "transfer" as const,
      amount: input.amount,
      occurredAt: input.occurredAt,
      note: input.note ?? null,
      merchant: null,
      receiptPath: null,
      transferGroupId: groupId,
      source: "manual" as const,
      createdAt: now,
      updatedAt: now,
    };
    const store = getStore();
    store.transactions.push(
      {
        ...base,
        id: uid("trx"),
        walletId: input.fromWalletId,
        transferDirection: "out",
      },
      {
        ...base,
        id: uid("trx"),
        walletId: input.toWalletId,
        transferDirection: "in",
      },
    );
  },

  async updateTransaction(userId, id, patch) {
    const transaction = getStore().transactions.find(
      (t) => t.userId === userId && t.id === id,
    );
    if (!transaction) return null;
    Object.assign(transaction, patch, { updatedAt: new Date().toISOString() });
    return transaction;
  },

  async deleteTransaction(userId, id) {
    const store = getStore();
    const target = store.transactions.find((t) => t.userId === userId && t.id === id);
    if (!target) return false;
    store.transactions = store.transactions.filter((t) => {
      if (t.userId !== userId) return true;
      if (t.id === id) return false;
      if (target.transferGroupId && t.transferGroupId === target.transferGroupId) return false;
      return true;
    });
    return true;
  },

  async listBudgets(userId, month) {
    return getStore().budgets.filter((b) => b.userId === userId && b.month === month);
  },

  async upsertBudget(userId, input) {
    const store = getStore();
    const existing = store.budgets.find(
      (b) =>
        b.userId === userId &&
        b.categoryId === input.categoryId &&
        b.month === input.month,
    );
    if (existing) {
      existing.limitAmount = input.limitAmount;
      return existing;
    }
    const budget: Budget = { ...input, id: uid("budget"), userId };
    store.budgets.push(budget);
    return budget;
  },

  async deleteBudget(userId, id) {
    const store = getStore();
    const before = store.budgets.length;
    store.budgets = store.budgets.filter((b) => !(b.userId === userId && b.id === id));
    return store.budgets.length < before;
  },
};

export const repo: Repo = isDemoMode ? demoRepo : drizzleRepo;

export function seedDefaultsForNewUser(userId: string) {
  return demoRepo.saveProfile(userId, {}).then(() => undefined);
}
