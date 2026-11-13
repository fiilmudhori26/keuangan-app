import type { Category, Wallet } from "../types";
import { parseShorthandAmount } from "../money";

export type ScanDraft = {
  type: "income" | "expense";
  amount: number;
  occurredAt: string;
  merchant?: string;
  note?: string;
  categoryId?: string;
  walletId?: string;
  source: "ai_scan" | "ai_text";
  /** Human readable notes shown in the review screen. */
  hints: string[];
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  makan: ["makan", "kopi", "sarapan", "siang", "malam", "resto", "restoran", "warung", "kafe", "jajan", "roti", "nasi"],
  transportasi: ["ojek", "gojek", "grab", "bensin", "parkir", "tol", "bus", "kereta", "transport", "taksi"],
  belanja: ["belanja", "indomaret", "alfamart", "supermarket", "minimarket", "sayur", "pasar"],
  tagihan: ["listrik", "air", "internet", "pulsa", "tagihan", "langganan", "wifi", "bpjs"],
  kesehatan: ["obat", "vitamin", "dokter", "klinik", "rumah sakit", "apotek"],
  hiburan: ["nonton", "bioskop", "game", "streaming", "spotify", "netflix", "konser"],
  pendidikan: ["buku", "kursus", "kelas", "sekolah", "kuliah", "seminar"],
  gaji: ["gaji", "bonus", "thr", "upah", "honor"],
};

const INCOME_KEYWORDS = ["gaji", "bonus", "thr", "honor", "terima", "masuk", "refund", "cashback"];

const WALLET_KEYWORDS: Record<string, string[]> = {
  tunai: ["tunai", "cash", "kontan"],
  gopay: ["gopay"],
  ovo: ["ovo"],
  dana: ["dana"],
  shopeepay: ["shopeepay", "shopee pay"],
  bca: ["bca"],
  mandiri: ["mandiri"],
  bni: ["bni"],
  bri: ["bri"],
};

/**
 * Rule-based fallback for free text entry ("makan siang 25rb gopay").
 * Deterministic and offline so the flow still works without an AI key.
 */
export function parseQuickEntry(
  text: string,
  categories: Category[],
  wallets: Wallet[],
  today: string,
): ScanDraft {
  const lower = text.toLowerCase();
  const hints: string[] = [];

  const amount = parseShorthandAmount(lower) ?? 0;
  if (amount <= 0) hints.push("Nominal belum terbaca. Isi manual.");
  else hints.push(`Nominal terbaca ${amount.toLocaleString("id-ID")}. Periksa sebelum menyimpan.`);

  const type: ScanDraft["type"] = INCOME_KEYWORDS.some((keyword) => lower.includes(keyword))
    ? "income"
    : "expense";

  const category =
    categories.find((item) => {
      if (item.type !== type) return false;
      const name = item.name.toLowerCase();
      if (lower.includes(name)) return true;
      return (CATEGORY_KEYWORDS[name] ?? []).some((keyword) => lower.includes(keyword));
    }) ?? categories.find((item) => item.type === type);

  if (category) hints.push(`Kategori disarankan: ${category.name}.`);
  else hints.push("Kategori belum terdeteksi. Pilih manual.");

  const wallet =
    wallets.find((item) => {
      const name = item.name.toLowerCase();
      if (lower.includes(name)) return true;
      return (WALLET_KEYWORDS[name] ?? []).some((keyword) => lower.includes(keyword));
    }) ?? wallets[0];

  return {
    type,
    amount,
    occurredAt: today,
    note: text.trim().slice(0, 200),
    categoryId: category?.id,
    walletId: wallet?.id,
    source: "ai_text",
    hints,
  };
}
