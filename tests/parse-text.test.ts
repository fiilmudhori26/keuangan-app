import { describe, expect, it } from "vitest";
import { parseQuickEntry } from "@/lib/ai/parse-text";
import type { Category, Wallet } from "@/lib/types";

const categories: Category[] = [
  { id: "c-makan", userId: "u1", name: "Makan", type: "expense", icon: "Utensils", color: "#0B7A4B", isArchived: false },
  { id: "c-transport", userId: "u1", name: "Transportasi", type: "expense", icon: "Bus", color: "#2F6FDE", isArchived: false },
  { id: "c-gaji", userId: "u1", name: "Gaji", type: "income", icon: "Briefcase", color: "#0B7A4B", isArchived: false },
];

const wallets: Wallet[] = [
  { id: "w-tunai", userId: "u1", name: "Tunai", type: "cash", initialBalance: 0, color: "#0B7A4B", icon: "Wallet", isArchived: false, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "w-gopay", userId: "u1", name: "GoPay", type: "ewallet", initialBalance: 0, color: "#0E9AA7", icon: "Smartphone", isArchived: false, createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("parseQuickEntry", () => {
  it("parses expense, category, and wallet from free text", () => {
    const draft = parseQuickEntry("makan siang 25rb gopay", categories, wallets, "2026-11-13");
    expect(draft.type).toBe("expense");
    expect(draft.amount).toBe(25_000);
    expect(draft.categoryId).toBe("c-makan");
    expect(draft.walletId).toBe("w-gopay");
    expect(draft.occurredAt).toBe("2026-11-13");
    expect(draft.source).toBe("ai_text");
  });

  it("detects income keywords", () => {
    const draft = parseQuickEntry("gaji 8jt bca", categories, wallets, "2026-11-13");
    expect(draft.type).toBe("income");
    expect(draft.categoryId).toBe("c-gaji");
  });

  it("falls back to the first category and warns when amount is missing", () => {
    const draft = parseQuickEntry("kopi", categories, wallets, "2026-11-13");
    expect(draft.amount).toBe(0);
    expect(draft.categoryId).toBe("c-makan");
    expect(draft.hints.join(" ")).toContain("Nominal belum terbaca");
  });
});
