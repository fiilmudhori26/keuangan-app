export type WalletType = "cash" | "bank" | "ewallet" | "other";
export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type TransferDirection = "in" | "out";
export type TransactionSource = "manual" | "ai_scan" | "ai_text";
export type ThemePreference = "system" | "light" | "dark";

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  initialBalance: number;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isArchived: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string | null;
  type: TransactionType;
  transferDirection: TransferDirection | null;
  amount: number;
  occurredAt: string; // YYYY-MM-DD
  note: string | null;
  merchant: string | null;
  receiptPath: string | null;
  transferGroupId: string | null;
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  month: string; // YYYY-MM
  limitAmount: number;
};

export type Profile = {
  userId: string;
  displayName: string;
  currency: string;
  monthStartDay: number;
  theme: ThemePreference;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-wallet",
  other: "Lainnya",
};

export const WALLET_TYPE_ICONS: Record<WalletType, string> = {
  cash: "Wallet",
  bank: "Landmark",
  ewallet: "Smartphone",
  other: "CircleDollarSign",
};

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}> = [
  { name: "Makan", type: "expense", icon: "Utensils", color: "#0B7A4B" },
  { name: "Transportasi", type: "expense", icon: "Bus", color: "#2F6FDE" },
  { name: "Belanja", type: "expense", icon: "ShoppingBag", color: "#C98A0B" },
  { name: "Tagihan", type: "expense", icon: "ReceiptText", color: "#7C5CD6" },
  { name: "Kesehatan", type: "expense", icon: "HeartPulse", color: "#0E9AA7" },
  { name: "Hiburan", type: "expense", icon: "Gamepad2", color: "#D6457A" },
  { name: "Pendidikan", type: "expense", icon: "GraduationCap", color: "#64748B" },
  { name: "Gaji", type: "income", icon: "Briefcase", color: "#0B7A4B" },
  { name: "Lainnya", type: "expense", icon: "Shapes", color: "#E0622D" },
];
