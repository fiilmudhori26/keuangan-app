/**
 * Money rules (PRD §8): amounts are integers in whole rupiah, never floats.
 */
export const MAX_AMOUNT = 999_999_999_999;

const idr = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return `Rp ${idr.format(Math.round(amount))}`;
}

export function formatSigned(amount: number, type: "income" | "expense"): string {
  const sign = type === "income" ? "+" : "−";
  return `${sign}${formatRupiah(Math.abs(amount))}`;
}

/** Compact form for tight spaces: Rp 1,2 jt / Rp 850 rb / Rp 2,4 M */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${(amount / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  }
  return formatRupiah(amount);
}

/** Digits only -> integer rupiah. Rejects anything non-finite. */
export function parseAmountInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const value = Number.parseInt(digits, 10);
  if (!Number.isFinite(value)) return 0;
  return Math.min(value, MAX_AMOUNT);
}

/**
 * Parse shorthand text used by quick entry and the AI text fallback:
 * "makan siang 25rb gopay", "gaji 5,2jt", "kopi 15.000 tunai".
 */
const UNIT_MULTIPLIERS: Record<string, number> = {
  rb: 1_000,
  ribu: 1_000,
  k: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
  m: 1_000_000_000,
  miliar: 1_000_000_000,
};

export function parseShorthandAmount(text: string): number | null {
  const match = text
    .toLowerCase()
    .match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta|miliar|m|k)?\b/);
  if (!match) return null;
  const numeric = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(numeric)) return null;
  const unit = match[2] ?? "";
  const multiplier = UNIT_MULTIPLIERS[unit] ?? 1;
  // "15.000" without a unit: treat dots as thousand separators, not decimals.
  const value = !unit && /^\d{1,3}(\.\d{3})+$/.test(match[1])
    ? Number.parseInt(match[1].replace(/\./g, ""), 10)
    : Math.round(numeric * multiplier);
  if (value <= 0) return null;
  return Math.min(value, MAX_AMOUNT);
}
