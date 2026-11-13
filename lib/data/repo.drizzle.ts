import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { requireDb } from "../db";
import * as schema from "../db/schema";
import { uid } from "../utils";
import type { Repo, TransactionFilter } from "./types";
import type { Budget, Category, Profile, Transaction, Wallet } from "../types";

function iso(value: Date | string | null): string {
  if (!value) return new Date().toISOString();
  return typeof value === "string" ? value : value.toISOString();
}

type WalletRow = typeof schema.wallets.$inferSelect;
type CategoryRow = typeof schema.categories.$inferSelect;
type TransactionRow = typeof schema.transactions.$inferSelect;
type BudgetRow = typeof schema.budgets.$inferSelect;
type ProfileRow = typeof schema.profiles.$inferSelect;

function mapWallet(row: WalletRow): Wallet {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type as Wallet["type"],
    initialBalance: row.initialBalance,
    color: row.color,
    icon: row.icon,
    isArchived: row.isArchived,
    createdAt: iso(row.createdAt),
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    type: row.type as Category["type"],
    icon: row.icon,
    color: row.color,
    isArchived: row.isArchived,
  };
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.userId,
    walletId: row.walletId,
    categoryId: row.categoryId,
    type: row.type as Transaction["type"],
    transferDirection: row.transferDirection as Transaction["transferDirection"],
    amount: row.amount,
    occurredAt: row.occurredAt,
    note: row.note,
    merchant: row.merchant,
    receiptPath: row.receiptPath,
    transferGroupId: row.transferGroupId,
    source: row.source as Transaction["source"],
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    month: row.month,
    limitAmount: row.limitAmount,
  };
}

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.userId,
    displayName: row.displayName,
    currency: row.currency,
    monthStartDay: row.monthStartDay,
    theme: row.theme as Profile["theme"],
  };
}

export const drizzleRepo: Repo = {
  async getProfile(userId) {
    const db = requireDb();
    const [row] = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId));
    return row ? mapProfile(row) : null;
  },

  async saveProfile(userId, patch) {
    const db = requireDb();
    const [row] = await db
      .insert(schema.profiles)
      .values({
        userId,
        displayName: patch.displayName ?? "",
        currency: patch.currency ?? "IDR",
        monthStartDay: patch.monthStartDay ?? 1,
        theme: patch.theme ?? "system",
      })
      .onConflictDoUpdate({
        target: schema.profiles.userId,
        set: {
          ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
          ...(patch.currency !== undefined ? { currency: patch.currency } : {}),
          ...(patch.monthStartDay !== undefined ? { monthStartDay: patch.monthStartDay } : {}),
          ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
        },
      })
      .returning();
    return mapProfile(row);
  },

  async deleteUserData(userId) {
    const db = requireDb();
    await db.delete(schema.transactions).where(eq(schema.transactions.userId, userId));
    await db.delete(schema.budgets).where(eq(schema.budgets.userId, userId));
    await db.delete(schema.wallets).where(eq(schema.wallets.userId, userId));
    await db.delete(schema.categories).where(eq(schema.categories.userId, userId));
    await db.delete(schema.profiles).where(eq(schema.profiles.userId, userId));
  },

  async listWallets(userId, includeArchived = false) {
    const db = requireDb();
    const where = includeArchived
      ? eq(schema.wallets.userId, userId)
      : and(eq(schema.wallets.userId, userId), eq(schema.wallets.isArchived, false));
    const rows = await db.select().from(schema.wallets).where(where).orderBy(asc(schema.wallets.createdAt));
    return rows.map(mapWallet);
  },

  async getWallet(userId, id) {
    const db = requireDb();
    const [row] = await db
      .select()
      .from(schema.wallets)
      .where(and(eq(schema.wallets.userId, userId), eq(schema.wallets.id, id)));
    return row ? mapWallet(row) : null;
  },

  async createWallet(userId, input) {
    const db = requireDb();
    const [row] = await db
      .insert(schema.wallets)
      .values({ ...input, id: uid("wallet"), userId })
      .returning();
    return mapWallet(row);
  },

  async updateWallet(userId, id, patch) {
    const db = requireDb();
    const [row] = await db
      .update(schema.wallets)
      .set(patch)
      .where(and(eq(schema.wallets.userId, userId), eq(schema.wallets.id, id)))
      .returning();
    return row ? mapWallet(row) : null;
  },

  async listCategories(userId, includeArchived = false) {
    const db = requireDb();
    const where = includeArchived
      ? eq(schema.categories.userId, userId)
      : and(eq(schema.categories.userId, userId), eq(schema.categories.isArchived, false));
    const rows = await db.select().from(schema.categories).where(where);
    return rows.map(mapCategory);
  },

  async getCategory(userId, id) {
    const db = requireDb();
    const [row] = await db
      .select()
      .from(schema.categories)
      .where(and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)));
    return row ? mapCategory(row) : null;
  },

  async createCategory(userId, input) {
    const db = requireDb();
    const [row] = await db
      .insert(schema.categories)
      .values({ ...input, id: uid("cat"), userId })
      .returning();
    return mapCategory(row);
  },

  async updateCategory(userId, id, patch) {
    const db = requireDb();
    const [row] = await db
      .update(schema.categories)
      .set(patch)
      .where(and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)))
      .returning();
    return row ? mapCategory(row) : null;
  },

  async listTransactions(userId, filter: TransactionFilter = {}) {
    const db = requireDb();
    const conditions = [eq(schema.transactions.userId, userId)];
    if (filter.from) conditions.push(gte(schema.transactions.occurredAt, filter.from));
    if (filter.to) conditions.push(lte(schema.transactions.occurredAt, filter.to));
    if (filter.walletId) conditions.push(eq(schema.transactions.walletId, filter.walletId));
    if (filter.categoryId) conditions.push(eq(schema.transactions.categoryId, filter.categoryId));
    if (filter.type) conditions.push(eq(schema.transactions.type, filter.type));
    if (filter.search) {
      const term = `%${filter.search.trim()}%`;
      const search = or(
        ilike(schema.transactions.note, term),
        ilike(schema.transactions.merchant, term),
      );
      if (search) conditions.push(search);
    }
    const rows = await db
      .select()
      .from(schema.transactions)
      .where(and(...conditions))
      .orderBy(desc(schema.transactions.occurredAt), desc(schema.transactions.createdAt))
      .limit(filter.limit ?? 500);
    return rows.map(mapTransaction);
  },

  async getTransaction(userId, id) {
    const db = requireDb();
    const [row] = await db
      .select()
      .from(schema.transactions)
      .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)));
    return row ? mapTransaction(row) : null;
  },

  async createTransaction(userId, input) {
    const db = requireDb();
    const [row] = await db
      .insert(schema.transactions)
      .values({ ...input, id: uid("trx"), userId })
      .returning();
    return mapTransaction(row);
  },

  async createTransfer(userId, input) {
    const db = requireDb();
    const groupId = uid("transfer");
    const base = {
      userId,
      categoryId: null,
      type: "transfer",
      amount: input.amount,
      occurredAt: input.occurredAt,
      note: input.note ?? null,
      merchant: null,
      receiptPath: null,
      transferGroupId: groupId,
      source: "manual",
    };
    await db.insert(schema.transactions).values([
      { ...base, id: uid("trx"), walletId: input.fromWalletId, transferDirection: "out" },
      { ...base, id: uid("trx"), walletId: input.toWalletId, transferDirection: "in" },
    ]);
  },

  async updateTransaction(userId, id, patch) {
    const db = requireDb();
    const [row] = await db
      .update(schema.transactions)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)))
      .returning();
    return row ? mapTransaction(row) : null;
  },

  async deleteTransaction(userId, id) {
    const db = requireDb();
    const existing = await this.getTransaction(userId, id);
    if (!existing) return false;
    if (existing.transferGroupId) {
      await db
        .delete(schema.transactions)
        .where(
          and(
            eq(schema.transactions.userId, userId),
            eq(schema.transactions.transferGroupId, existing.transferGroupId),
          ),
        );
      return true;
    }
    await db
      .delete(schema.transactions)
      .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)));
    return true;
  },

  async listBudgets(userId, month) {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.budgets)
      .where(and(eq(schema.budgets.userId, userId), eq(schema.budgets.month, month)));
    return rows.map(mapBudget);
  },

  async upsertBudget(userId, input) {
    const db = requireDb();
    const [row] = await db
      .insert(schema.budgets)
      .values({ ...input, id: uid("budget"), userId })
      .onConflictDoUpdate({
        target: [schema.budgets.userId, schema.budgets.categoryId, schema.budgets.month],
        set: { limitAmount: input.limitAmount },
      })
      .returning();
    return mapBudget(row);
  },

  async deleteBudget(userId, id) {
    const db = requireDb();
    const rows = await db
      .delete(schema.budgets)
      .where(and(eq(schema.budgets.userId, userId), eq(schema.budgets.id, id)))
      .returning({ id: schema.budgets.id });
    return rows.length > 0;
  },
};
