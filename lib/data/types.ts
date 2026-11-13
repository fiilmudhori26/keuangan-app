import type {
  Budget,
  Category,
  Profile,
  Transaction,
  TransactionType,
  Wallet,
} from "../types";

export type NewWallet = Omit<Wallet, "id" | "userId" | "createdAt">;
export type NewCategory = Omit<Category, "id" | "userId">;
export type NewTransaction = Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">;

export type TransactionFilter = {
  from?: string;
  to?: string;
  walletId?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
  limit?: number;
};

export type BudgetInput = { categoryId: string; month: string; limitAmount: number };

export type Repo = {
  getProfile(userId: string): Promise<Profile | null>;
  saveProfile(userId: string, patch: Partial<Omit<Profile, "userId">>): Promise<Profile>;
  deleteUserData(userId: string): Promise<void>;

  listWallets(userId: string, includeArchived?: boolean): Promise<Wallet[]>;
  getWallet(userId: string, id: string): Promise<Wallet | null>;
  createWallet(userId: string, input: NewWallet): Promise<Wallet>;
  updateWallet(userId: string, id: string, patch: Partial<NewWallet>): Promise<Wallet | null>;

  listCategories(userId: string, includeArchived?: boolean): Promise<Category[]>;
  getCategory(userId: string, id: string): Promise<Category | null>;
  createCategory(userId: string, input: NewCategory): Promise<Category>;
  updateCategory(
    userId: string,
    id: string,
    patch: Partial<NewCategory>,
  ): Promise<Category | null>;

  listTransactions(userId: string, filter?: TransactionFilter): Promise<Transaction[]>;
  getTransaction(userId: string, id: string): Promise<Transaction | null>;
  createTransaction(userId: string, input: NewTransaction): Promise<Transaction>;
  createTransfer(
    userId: string,
    input: { fromWalletId: string; toWalletId: string; amount: number; occurredAt: string; note?: string },
  ): Promise<void>;
  updateTransaction(
    userId: string,
    id: string,
    patch: Partial<NewTransaction>,
  ): Promise<Transaction | null>;
  deleteTransaction(userId: string, id: string): Promise<boolean>;

  listBudgets(userId: string, month: string): Promise<Budget[]>;
  upsertBudget(userId: string, input: BudgetInput): Promise<Budget>;
  deleteBudget(userId: string, id: string): Promise<boolean>;
};
