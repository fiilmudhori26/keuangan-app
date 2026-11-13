import { DEFAULT_CATEGORIES, type Category, type Profile, type Transaction, type Wallet } from "../types";
import { monthKey, shiftMonth, todayKey, toDateKey } from "../date";

export type DemoUser = { id: string; name: string; email: string };

type Store = {
  users: DemoUser[];
  profiles: Profile[];
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Array<{ id: string; userId: string; categoryId: string; month: string; limitAmount: number }>;
};

const DEMO_USER_ID = "demo-user";
export const DEMO_USER: DemoUser = {
  id: DEMO_USER_ID,
  name: "Akbar",
  email: "demo@keuangan.local",
};

declare global {
  var __keuanganStore: Store | undefined;
}

function dateKeyOffset(daysAgo: number): string {
  const now = new Date();
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo));
}

function seed(): Store {
  const now = new Date().toISOString();
  const userId = DEMO_USER_ID;

  const wallets: Wallet[] = [
    {
      id: "wallet_tunai",
      userId,
      name: "Tunai",
      type: "cash",
      initialBalance: 750_000,
      color: "#0B7A4B",
      icon: "Wallet",
      isArchived: false,
      createdAt: now,
    },
    {
      id: "wallet_bca",
      userId,
      name: "BCA",
      type: "bank",
      initialBalance: 8_500_000,
      color: "#2F6FDE",
      icon: "Landmark",
      isArchived: false,
      createdAt: now,
    },
    {
      id: "wallet_gopay",
      userId,
      name: "GoPay",
      type: "ewallet",
      initialBalance: 350_000,
      color: "#0E9AA7",
      icon: "Smartphone",
      isArchived: false,
      createdAt: now,
    },
  ];

  const categories: Category[] = DEFAULT_CATEGORIES.map((category, index) => ({
    id: `cat_${index + 1}`,
    userId,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    isArchived: false,
  }));

  const byName = (name: string) => categories.find((c) => c.name === name)!.id;

  const rows: Array<[string, string, number, number, string, string?]> = [
    // [walletId, categoryName, amount, daysAgo, note, source]
    ["wallet_bca", "Gaji", 8_200_000, 28, "Gaji bulan lalu"],
    ["wallet_tunai", "Makan", 25_000, 0, "Makan siang"],
    ["wallet_gopay", "Transportasi", 18_000, 0, "Ojek ke kantor"],
    ["wallet_bca", "Belanja", 142_500, 1, "Belanja mingguan"],
    ["wallet_gopay", "Makan", 32_000, 1, "Kopi dan roti"],
    ["wallet_tunai", "Makan", 21_000, 2, "Nasi padang"],
    ["wallet_bca", "Tagihan", 375_000, 3, "Listrik dan air"],
    ["wallet_bca", "Hiburan", 89_000, 4, "Langganan streaming"],
    ["wallet_gopay", "Transportasi", 24_000, 5, "Ojek pulang"],
    ["wallet_tunai", "Kesehatan", 65_000, 7, "Vitamin"],
    ["wallet_bca", "Pendidikan", 150_000, 9, "Buku"],
    ["wallet_bca", "Gaji", 8_200_000, 12, "Gaji bulan ini"],
    ["wallet_gopay", "Makan", 45_000, 12, "Makan malam"],
    ["wallet_tunai", "Belanja", 78_000, 14, "Alat tulis"],
    ["wallet_bca", "Transportasi", 120_000, 16, "Isi bensin"],
    ["wallet_bca", "Makan", 235_000, 18, "Makan keluarga"],
    ["wallet_gopay", "Tagihan", 50_000, 20, "Pulsa"],
    ["wallet_tunai", "Makan", 27_000, 22, "Sarapan"],
  ];

  const transactions: Transaction[] = rows.map((row, index) => {
    const [walletId, categoryName, amount, daysAgo, note, source] = row;
    return {
      id: `trx_seed_${index + 1}`,
      userId,
      walletId,
      categoryId: byName(categoryName),
      type: categoryName === "Gaji" ? "income" : "expense",
      transferDirection: null,
      amount,
      occurredAt: dateKeyOffset(daysAgo),
      note: note ?? null,
      merchant: null,
      receiptPath: null,
      transferGroupId: null,
      source: (source as Transaction["source"]) ?? "manual",
      createdAt: now,
      updatedAt: now,
    };
  });

  const transferId = crypto.randomUUID();
  transactions.push(
    {
      id: `trx_transfer_out`,
      userId,
      walletId: "wallet_bca",
      categoryId: null,
      type: "transfer",
      transferDirection: "out",
      amount: 500_000,
      occurredAt: dateKeyOffset(6),
      note: "Isi saldo GoPay",
      merchant: null,
      receiptPath: null,
      transferGroupId: transferId,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `trx_transfer_in`,
      userId,
      walletId: "wallet_gopay",
      categoryId: null,
      type: "transfer",
      transferDirection: "in",
      amount: 500_000,
      occurredAt: dateKeyOffset(6),
      note: "Isi saldo GoPay",
      merchant: null,
      receiptPath: null,
      transferGroupId: transferId,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    },
  );

  const budgets = [
    { id: "budget_1", userId, categoryId: byName("Makan"), month: monthKey(), limitAmount: 1_500_000 },
    { id: "budget_2", userId, categoryId: byName("Transportasi"), month: monthKey(), limitAmount: 600_000 },
    { id: "budget_3", userId, categoryId: byName("Belanja"), month: monthKey(), limitAmount: 1_000_000 },
    {
      id: "budget_4",
      userId,
      categoryId: byName("Makan"),
      month: shiftMonth(monthKey(), -1),
      limitAmount: 1_400_000,
    },
  ];

  return {
    users: [DEMO_USER],
    profiles: [
      {
        userId,
        displayName: "Akbar",
        currency: "IDR",
        monthStartDay: 1,
        theme: "system",
      },
    ],
    wallets,
    categories,
    transactions,
    budgets,
  };
}

export function getStore(): Store {
  if (!globalThis.__keuanganStore) {
    globalThis.__keuanganStore = seed();
  }
  return globalThis.__keuanganStore;
}

export function resetStoreForTests() {
  globalThis.__keuanganStore = undefined;
}

export { DEMO_USER_ID, todayKey };
