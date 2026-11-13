import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { currentMonth } from "@/lib/services/queries";
import { isValidMonthKey, monthRange } from "@/lib/date";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddFromQuery } from "@/components/transactions/add-from-query";
import type { TransactionType } from "@/lib/types";

const TYPES: TransactionType[] = ["income", "expense", "transfer"];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const monthParam = typeof params.month === "string" ? params.month : undefined;
  const allTime = monthParam === "all";
  const month = monthParam && isValidMonthKey(monthParam) ? monthParam : currentMonth();

  const walletId = typeof params.wallet === "string" && params.wallet ? params.wallet : undefined;
  const categoryId = typeof params.category === "string" && params.category ? params.category : undefined;
  const type = TYPES.includes(params.type as TransactionType)
    ? (params.type as TransactionType)
    : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;

  const [wallets, categories, transactions] = await Promise.all([
    repo.listWallets(user.id),
    repo.listCategories(user.id),
    repo.listTransactions(user.id, {
      ...(allTime ? {} : monthRange(month)),
      walletId,
      categoryId,
      type,
      search,
      limit: 500,
    }),
  ]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] text-foreground">Transaksi</h1>
        <p className="text-[13px] text-muted-foreground">
          {allTime ? "Semua waktu" : `${transactions.length} transaksi bulan ini`}
        </p>
      </header>

      <TransactionFilters month={month} wallets={wallets} categories={categories} />

      <TransactionList
        transactions={transactions}
        wallets={wallets}
        categories={categories}
        emptyMessage="Belum ada transaksi yang cocok. Ubah filter atau catat transaksi baru."
      />

      <AddFromQuery wallets={wallets} categories={categories} />
    </div>
  );
}
