import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { currentMonth } from "@/lib/services/queries";
import { isValidMonthKey, monthRange } from "@/lib/date";

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak memiliki akses." }, { status: 401 });
  }

  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month") ?? currentMonth();
  const month = isValidMonthKey(monthParam) ? monthParam : currentMonth();

  const [transactions, categories, wallets] = await Promise.all([
    repo.listTransactions(user.id, { ...monthRange(month), limit: 5000 }),
    repo.listCategories(user.id, true),
    repo.listWallets(user.id, true),
  ]);

  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const walletName = new Map(wallets.map((wallet) => [wallet.id, wallet.name]));

  const header = ["Tanggal", "Jenis", "Kategori", "Dompet", "Nominal", "Catatan", "Merchant", "Sumber"];
  const rows = transactions.map((transaction) => [
    transaction.occurredAt,
    transaction.type === "income"
      ? "Pemasukan"
      : transaction.type === "expense"
        ? "Pengeluaran"
        : transaction.transferDirection === "in"
          ? "Transfer masuk"
          : "Transfer keluar",
    transaction.categoryId ? (categoryName.get(transaction.categoryId) ?? "") : "",
    walletName.get(transaction.walletId) ?? "",
    String(transaction.amount),
    transaction.note ?? "",
    transaction.merchant ?? "",
    transaction.source,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${month}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
