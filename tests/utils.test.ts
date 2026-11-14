import { describe, expect, it } from "vitest";
import { contrastOn } from "@/lib/utils";

describe("contrastOn", () => {
  describe("hex 3 digit", () => {
    it("expands #FFF to white and returns dark text", () => {
      expect(contrastOn("#FFF")).toBe("#262012");
    });

    it("expands #000 to black and returns white text", () => {
      expect(contrastOn("#000")).toBe("#FFFFFF");
    });

    it("expands mid light #FC4 (lum > 0,6) to dark text", () => {
      expect(contrastOn("#FC4")).toBe("#262012");
    });

    it("expands saturated #F5F (lum < 0,6) to white text", () => {
      expect(contrastOn("#F5F")).toBe("#FFFFFF");
    });

    it("expands #0F5 (hijau terang, lum > 0,6) to dark text", () => {
      expect(contrastOn("#0F5")).toBe("#262012");
    });
  });

  describe("hex 6 digit", () => {
    it("returns dark text on pure white", () => {
      expect(contrastOn("#FFFFFF")).toBe("#262012");
    });

    it("returns white text on pure black", () => {
      expect(contrastOn("#000000")).toBe("#FFFFFF");
    });

    it("returns white text on brand gelap #0B7A4B", () => {
      expect(contrastOn("#0B7A4B")).toBe("#FFFFFF");
    });

    it("returns white text on brand terang #34C38A (lum ≈ 0,42 < 0,6)", () => {
      expect(contrastOn("#34C38A")).toBe("#FFFFFF");
    });

    it("returns dark text on #D9D9D9 (lum ≈ 0,69 > 0,6)", () => {
      expect(contrastOn("#D9D9D9")).toBe("#262012");
    });

    it("returns dark text on near-white #E8F0EC", () => {
      expect(contrastOn("#E8F0EC")).toBe("#262012");
    });

    it("returns white text on dark ink #06130D", () => {
      expect(contrastOn("#06130D")).toBe("#FFFFFF");
    });
  });

  describe("hex 8 digit (alpha diabaikan)", () => {
    it("parses #FFFFFFCC as white -> dark text", () => {
      expect(contrastOn("#FFFFFFCC")).toBe("#262012");
    });

    it("parses #000000FF as black -> white text", () => {
      expect(contrastOn("#000000FF")).toBe("#FFFFFF");
    });

    it("parses #0B7A4BFF as brand gelap -> white text", () => {
      expect(contrastOn("#0B7A4BFF")).toBe("#FFFFFF");
    });

    it("parses #D9D9D9FF as light gray -> dark text", () => {
      expect(contrastOn("#D9D9D9FF")).toBe("#262012");
    });
  });

  describe("ambang lum > 0,6 terikat ke keluarga terang/gelap", () => {
    it("#F5C542 (lum ≈ 0,597, tepat di bawah ambang) -> teks putih", () => {
      expect(contrastOn("#F5C542")).toBe("#FFFFFF");
    });

    it("#F0C66B (lum ≈ 0,600, belum di atas 0,6) -> teks putih", () => {
      expect(contrastOn("#F0C66B")).toBe("#FFFFFF");
    });

    it("#FC4/#FFCC44 (lum ≈ 0,649, di atas ambang) -> teks gelap", () => {
      expect(contrastOn("#FFCC44")).toBe("#262012");
    });

    it("menerima huruf kecil dan campuran", () => {
      expect(contrastOn("#ffffff")).toBe("#262012");
      expect(contrastOn("#0b7a4b")).toBe("#FFFFFF");
    });

    it("mengabaikan spasi di tepi", () => {
      expect(contrastOn("  #FFFFFF  ")).toBe("#262012");
      expect(contrastOn(" #000000 ")).toBe("#FFFFFF");
    });
  });

  describe("input sampah -> #FFFFFF", () => {
    it("string kosong", () => {
      expect(contrastOn("")).toBe("#FFFFFF");
    });

    it("nama warna bukan hex", () => {
      expect(contrastOn("red")).toBe("#FFFFFF");
      expect(contrastOn("brand")).toBe("#FFFFFF");
    });

    it("hex dengan karakter non-hex", () => {
      expect(contrastOn("#GGGGGG")).toBe("#FFFFFF");
      expect(contrastOn("#12X456")).toBe("#FFFFFF");
    });

    it("panjang tidak valid (2, 4, 5, 7 digit)", () => {
      expect(contrastOn("#12")).toBe("#FFFFFF");
      expect(contrastOn("#1234")).toBe("#FFFFFF");
      expect(contrastOn("#12345")).toBe("#FFFFFF");
      expect(contrastOn("#1234567")).toBe("#FFFFFF");
    });

    it("tanda pagar ganda / tanpa tanda pagar yang salah", () => {
      expect(contrastOn("##FFFFFF")).toBe("#FFFFFF");
      expect(contrastOn("##0B7A4B")).toBe("#FFFFFF");
    });
  });
});
