import { describe, expect, it } from "vitest";
import { formatCompact, formatRupiah, parseAmountInput, parseShorthandAmount } from "@/lib/money";

describe("parseAmountInput", () => {
  it("keeps digits only and returns integers", () => {
    expect(parseAmountInput("Rp 25.000")).toBe(25_000);
    expect(parseAmountInput("25000")).toBe(25_000);
    expect(parseAmountInput("")).toBe(0);
    expect(parseAmountInput("abc")).toBe(0);
  });
});

describe("formatRupiah", () => {
  it("uses id-ID thousands separators without decimals", () => {
    expect(formatRupiah(25_000)).toBe("Rp 25.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("formats compact values", () => {
    expect(formatCompact(1_200_000)).toBe("Rp 1,2 jt");
    expect(formatCompact(850_000)).toBe("Rp 850 rb");
    expect(formatCompact(2_400_000_000)).toBe("Rp 2,4 M");
  });
});

describe("parseShorthandAmount", () => {
  it("understands rb, jt, and thousand separators", () => {
    expect(parseShorthandAmount("makan siang 25rb gopay")).toBe(25_000);
    expect(parseShorthandAmount("gaji 5,2jt")).toBe(5_200_000);
    expect(parseShorthandAmount("belanja 15.000")).toBe(15_000);
    expect(parseShorthandAmount("tanpa angka")).toBeNull();
  });
});
