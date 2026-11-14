"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, MoreHorizontal, Pencil, ReceiptText, Shapes, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { TransactionSheet } from "./transaction-sheet";
import { createTransactionAction, deleteTransactionAction } from "@/app/actions/transactions";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { formatRupiah } from "@/lib/money";
import { formatRelativeDate } from "@/lib/date";
import { groupByDate } from "@/lib/services/finance";
import { cn } from "@/lib/utils";
import type { Category, Transaction, Wallet } from "@/lib/types";

/** Harus sama dengan --stagger-step di app/globals.css. */
const STAGGER_STEP = 30;
const STAGGER_MAX = 8;
/** Ambang geser sebelum aksi dilepas (px). */
const SWIPE_THRESHOLD = 72;

/**
 * Baris yang bisa digeser: kiri = Hapus, kanan = Ubah (transfer: hapus saja).
 * Lapisan aksi bersifat dekoratif (aria-hidden); tombol menu tetap tersedia
 * sebagai alternatif aksesibilitas.
 */
function SwipeableRow({
  isTransfer,
  animated,
  animationDelay,
  onEdit,
  onDelete,
  children,
}: {
  isTransfer: boolean;
  animated: boolean;
  animationDelay?: string;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const movedRef = useRef(false);
  const capturedRef = useRef(false);

  const editPast = dx >= SWIPE_THRESHOLD && !isTransfer;
  const deletePast = dx <= -SWIPE_THRESHOLD;
  const actionTransition = reduceMotion
    ? undefined
    : "background-color 150ms ease-out, opacity 150ms ease-out";

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    movedRef.current = false;
    capturedRef.current = false;
    setDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    let delta = event.clientX - startX.current;
    if (isTransfer && delta > 0) delta = 0; // transfer tidak bisa diubah
    if (Math.abs(delta) > 6) {
      movedRef.current = true;
      // Capture baru dipasang setelah slop terlewati, agar klik pada
      // tombol di dalam baris (mis. menu aksi) tetap bekerja.
      if (!capturedRef.current) {
        capturedRef.current = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // abaikan bila capture tidak tersedia
        }
      }
    }
    setDx(delta);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>, commit: boolean) {
    if (!dragging) return;
    let delta = event.clientX - startX.current;
    if (isTransfer && delta > 0) delta = 0; // transfer tidak bisa diubah
    setDragging(false);
    setDx(0);
    capturedRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer capture mungkin belum/sudah dilepas oleh browser
    }
    if (!commit) return;
    if (delta <= -SWIPE_THRESHOLD) onDelete();
    else if (delta >= SWIPE_THRESHOLD && !isTransfer) onEdit();
  }

  function cancelDrag() {
    setDragging(false);
    setDx(0);
    capturedRef.current = false;
    movedRef.current = false;
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    // Tahan klik (mis. pada tombol menu) bila interaksi barusan adalah geseran.
    if (movedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      movedRef.current = false;
    }
  }

  return (
    <li
      className={cn("relative overflow-hidden", animated && "animate-fade-up")}
      style={animated ? { animationDelay } : undefined}
    >
      {/* Lapisan aksi di belakang konten */}
      <div aria-hidden className="absolute inset-0 flex">
        <div
          className={cn(
            "flex flex-1 items-center gap-2 pl-4 text-primary",
            editPast ? "bg-secondary" : "bg-muted",
          )}
          style={{
            opacity: dx > 0 && !isTransfer ? 1 : 0,
            transition: actionTransition,
          }}
        >
          <Pencil className="size-5" aria-hidden />
          <span className="text-[13px] font-semibold">Ubah</span>
        </div>
        <div
          className={cn(
            "flex flex-1 items-center justify-end gap-2 pr-4 text-destructive",
            deletePast ? "bg-expense-soft" : "bg-muted",
          )}
          style={{
            opacity: dx < 0 ? 1 : 0,
            transition: actionTransition,
          }}
        >
          <span className="text-[13px] font-semibold">
            {isTransfer ? "Hapus transfer" : "Hapus"}
          </span>
          <Trash2 className="size-5" aria-hidden />
        </div>
      </div>
      {/* Konten baris (menggeser) */}
      <div
        className="relative flex min-h-[56px] touch-pan-y select-none items-center gap-3 bg-background py-2 transition-colors duration-150 hover:bg-muted/40"
        style={{
          transform: `translateX(${dx}px)`,
          transition:
            reduceMotion || dragging
              ? undefined
              : "transform 180ms ease-out, background-color 150ms ease-out",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endDrag(event, true)}
        onPointerCancel={cancelDrag}
        onPointerLeave={() => {
          // Tanpa capture (belum lewat slop), pelepasan di luar baris harus mengakhiri geseran.
          if (dragging && !capturedRef.current) cancelDrag();
        }}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </li>
  );
}

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
                <SwipeableRow
                  key={`${transaction.id}:${transaction.type}`}
                  isTransfer={isTransfer}
                  animated={animated}
                  animationDelay={
                    animated ? `${rowIndex * STAGGER_STEP}ms` : undefined
                  }
                  onEdit={() => setEditing(transaction)}
                  onDelete={() => setDeleting(transaction)}
                >
                  {category && !isTransfer ? (
                    <CategoryIcon category={category} size={40} />
                  ) : (
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                      style={{
                        backgroundColor:
                          "color-mix(in oklab, var(--muted-foreground) 15%, transparent)",
                      }}
                    >
                      {isTransfer ? (
                        <ArrowLeftRight className="size-5" strokeWidth={1.5} fill="currentColor" aria-hidden />
                      ) : (
                        <Shapes className="size-5" strokeWidth={1.5} fill="currentColor" aria-hidden />
                      )}
                    </span>
                  )}
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
                </SwipeableRow>
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
        description={
          deleting?.type === "transfer"
            ? "Saldo dompet akan dihitung ulang. Transfer dihapus permanen dan tidak bisa diurungkan."
            : "Saldo dompet akan dihitung ulang. Kamu bisa menekan “Urungkan” pada notifikasi (6 detik)."
        }
        loading={pending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          const target = deleting;
          if (!target) return;
          startTransition(async () => {
            const result = await deleteTransactionAction(target.id);
            setDeleting(null);
            router.refresh();
            if (!result.ok) {
              push(result.message ?? "Transaksi gagal dihapus.", "error");
              return;
            }
            const categoryId = target.categoryId;
            if (target.type !== "transfer" && categoryId) {
              // Salinan data untuk "Urungkan": buat ulang dengan id baru.
              const { type } = target;
              push("Transaksi dihapus", "success", {
                duration: 6000,
                action: {
                  label: "Urungkan",
                  onAction: () => {
                    void (async () => {
                      const restored = await createTransactionAction({
                        type,
                        amount: target.amount,
                        walletId: target.walletId,
                        categoryId,
                        occurredAt: target.occurredAt,
                        note: target.note ?? undefined,
                        merchant: target.merchant ?? undefined,
                        receiptPath: target.receiptPath ?? undefined,
                        source: target.source,
                      });
                      push(
                        restored.ok
                          ? "Transaksi dikembalikan"
                          : (restored.message ?? "Transaksi gagal dikembalikan."),
                        restored.ok ? "success" : "error",
                      );
                      router.refresh();
                    })();
                  },
                },
              });
            } else {
              push(result.message ?? "Transaksi dihapus", "success");
            }
          });
        }}
      />
    </div>
  );
}
