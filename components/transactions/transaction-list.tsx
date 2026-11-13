"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ReceiptText } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { TransactionSheet } from "./transaction-sheet";
import { deleteTransactionAction } from "@/app/actions/transactions";
import { formatRupiah } from "@/lib/money";
import { formatRelativeDate } from "@/lib/date";
import { groupByDate } from "@/lib/services/finance";
import type { Category, Transaction, Wallet } from "@/lib/types";

export function TransactionList({
  transactions,
  wallets,
  categories,
  emptyMessage = "Belum ada transaksi bulan ini. Catat pengeluaran pertamamu.",
}: {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  emptyMessage?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [actionsFor, setActionsFor] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [pending, startTransition] = useTransition();

  const groups = groupByDate(transactions);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const walletById = new Map(wallets.map((wallet) => [wallet.id, wallet]));

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[14px] border border-dashed border-border px-6 py-10 text-center">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        >
          <ReceiptText className="size-6" />
        </span>
        <p className="mt-3 max-w-[30ch] text-[16px] leading-6 text-muted-foreground">{emptyMessage}</p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/transactions?add=1"
            className="flex h-11 items-center rounded-[10px] bg-primary px-4 text-[14px] font-semibold text-primary-foreground transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
          >
            Tambah transaksi
          </Link>
        </div>
      </div>
    );
  }

  const rowIndexById = new Map(
    groups.flatMap((group) => group.items).map((transaction, index) => [transaction.id, index]),
  );

  return (
    <div>
      {groups.map((group) => (
        <section key={group.date} className="mb-4">
          <h3 className="mb-1 text-[13px] font-medium text-muted-foreground">
            {formatRelativeDate(group.date)}
          </h3>
          <ul className="divide-y divide-border border-y border-border">
            {group.items.map((transaction) => {
              const delay = `${Math.min(rowIndexById.get(transaction.id) ?? 0, 8) * 30}ms`;
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : null;
              const wallet = walletById.get(transaction.walletId);
              const isTransfer = transaction.type === "transfer";
              const outgoing = transaction.transferDirection === "out";

              return (
                <li
                  key={transaction.id}
                  style={{ animationDelay: delay }}
                  className="animate-fade-up flex min-h-[56px] items-center gap-3 py-2 transition-colors duration-150 hover:bg-muted/40"
                >
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      backgroundColor: `${category?.color ?? "#5B6B63"}22`,
                      color: category?.color ?? "#5B6B63",
                    }}
                  >
                    {(category?.name ?? (isTransfer ? "T" : "?")).slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-medium text-foreground">
                      {isTransfer
                        ? outgoing
                          ? `Transfer ke ${walletById.get(transaction.walletId)?.name ?? "dompet"}`
                          : "Transfer masuk"
                        : (category?.name ?? "Tanpa kategori")}
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">
                      {[transaction.note, wallet?.name].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p
                    className={
                      isTransfer
                        ? "num text-[16px] font-semibold text-muted-foreground"
                        : transaction.type === "income"
                          ? "num text-[16px] font-semibold text-primary"
                          : "num text-[16px] font-semibold text-foreground"
                    }
                  >
                    {isTransfer ? "↔ " : transaction.type === "income" ? "+" : "−"}
                    {formatRupiah(transaction.amount)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Aksi untuk transaksi ${category?.name ?? "transfer"}`}
                    onClick={() => setActionsFor(transaction)}
                    className="flex size-11 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted"
                  >
                    <MoreHorizontal className="size-5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <TransactionSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        wallets={wallets}
        categories={categories}
        initial={editing}
      />

      <Sheet
        open={!!actionsFor}
        onClose={() => setActionsFor(null)}
        title="Aksi transaksi"
      >
        <div className="space-y-2 pb-2">
          {actionsFor?.type === "transfer" ? (
            <p className="text-[13px] text-muted-foreground">
              Transfer tidak dapat diubah. Hapus lalu buat ulang bila perlu.
            </p>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(actionsFor);
                setActionsFor(null);
              }}
            >
              Ubah transaksi
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => {
              setDeleting(actionsFor);
              setActionsFor(null);
            }}
          >
            Hapus transaksi
          </Button>
        </div>
      </Sheet>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus transaksi ini?"
        description="Saldo dompet akan dihitung ulang. Tindakan ini tidak bisa dibatalkan."
        loading={pending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          startTransition(async () => {
            const result = await deleteTransactionAction(deleting.id);
            push(result.message ?? "", result.ok ? "success" : "error");
            setDeleting(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
