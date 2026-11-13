"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ReceiptText } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { TransactionSheet } from "./transaction-sheet";
import { deleteTransactionAction } from "@/app/actions/transactions";
import { formatRupiah } from "@/lib/money";
import { formatRelativeDate } from "@/lib/date";
import { groupByDate } from "@/lib/services/finance";
import { cn } from "@/lib/utils";
import type { Category, Transaction, Wallet } from "@/lib/types";

/** Harus sama dengan --stagger-step di app/globals.css. */
const STAGGER_STEP = 30;
const STAGGER_MAX = 8;

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
      <EmptyState
        icon={ReceiptText}
        message={emptyMessage}
        actionLabel="Tambah transaksi"
        actionHref="/transactions?add=1"
      />
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
              const rowIndex = rowIndexById.get(transaction.id) ?? 0;
              const animated = rowIndex < STAGGER_MAX;
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : null;
              const wallet = walletById.get(transaction.walletId);
              const isTransfer = transaction.type === "transfer";
              const outgoing = transaction.transferDirection === "out";

              return (
                <li
                  key={transaction.id}
                  style={animated ? { animationDelay: `${rowIndex * STAGGER_STEP}ms` } : undefined}
                  className={cn(
                    "flex min-h-[56px] items-center gap-3 py-2 transition-colors duration-150 hover:bg-muted/40",
                    animated && "animate-fade-up",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      backgroundColor: category?.color
                        ? `${category.color}22`
                        : "color-mix(in oklab, var(--muted-foreground) 15%, transparent)",
                      color: category?.color ?? "var(--muted-foreground)",
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
                          : "num text-[16px] font-semibold text-destructive"
                    }
                  >
                    {isTransfer ? "↔ " : transaction.type === "income" ? "+" : "−"}
                    {formatRupiah(transaction.amount)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Aksi untuk transaksi ${category?.name ?? "transfer"}`}
                    onClick={() => setActionsFor(transaction)}
                    className="flex size-11 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 hover:bg-muted"
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
