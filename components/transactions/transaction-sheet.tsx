"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Delete } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createTransactionAction, createTransferAction, updateTransactionAction } from "@/app/actions/transactions";
import { enqueue, isOnline } from "@/lib/offline-queue";
import { formatRupiah, parseAmountInput } from "@/lib/money";
import { todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Category, Transaction, Wallet } from "@/lib/types";

type Mode = "expense" | "income" | "transfer";

export function TransactionSheet({
  open,
  onClose,
  wallets,
  categories,
  initial,
  defaultMode = "expense",
}: {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  initial?: Transaction | null;
  defaultMode?: Mode;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  const [mode, setMode] = useState<Mode>("expense");
  const [digits, setDigits] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [occurredAt, setOccurredAt] = useState(todayKey());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === mode),
    [categories, mode],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setOccurredAt(initial?.occurredAt ?? todayKey());
    setNote(initial?.note ?? "");
    setWalletId(initial?.walletId ?? wallets[0]?.id ?? "");
    setToWalletId(wallets.find((w) => w.id !== (initial?.walletId ?? wallets[0]?.id))?.id ?? "");
    setDigits(initial ? String(initial.amount) : "");
    if (initial && initial.type !== "transfer") {
      setMode(initial.type);
      setCategoryId(initial.categoryId ?? "");
    } else {
      setMode(initial?.type === "transfer" ? "transfer" : defaultMode);
      setCategoryId(initial?.categoryId ?? categories.find((c) => c.type === "expense")?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  useEffect(() => {
    if (!open || initial) return;
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
  }, [filteredCategories, categoryId, open, initial]);

  const amount = parseAmountInput(digits);

  function press(key: string) {
    setError(null);
    setDigits((current) => {
      if (key === "back") return current.slice(0, -1);
      if (key === "000") return current === "" ? current : `${current}000`;
      if (current === "" && key === "0") return "";
      if (current.length >= 12) return current;
      return `${current}${key}`;
    });
  }

  function submit() {
    setError(null);
    if (amount <= 0) {
      setError("Nominal belum diisi. Masukkan angka lebih dari 0.");
      return;
    }
    if (!walletId) {
      setError("Pilih dompet terlebih dahulu.");
      return;
    }

    if (mode === "transfer") {
      if (!toWalletId || toWalletId === walletId) {
        setError("Dompet asal dan tujuan harus berbeda.");
        return;
      }
      startTransition(async () => {
        const result = await createTransferAction({
          fromWalletId: walletId,
          toWalletId,
          amount,
          occurredAt,
          note: note || undefined,
        });
        if (result.ok) {
          push(result.message ?? "Transfer disimpan");
          onClose();
          router.refresh();
        } else {
          setError(result.message ?? "Transfer gagal disimpan.");
        }
      });
      return;
    }

    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu.");
      return;
    }

    const input = {
      type: mode,
      amount,
      walletId,
      categoryId,
      occurredAt,
      note: note || undefined,
      source: "manual" as const,
    };

    if (!isOnline()) {
      enqueue(input);
      push("Tidak ada koneksi. Transaksi disimpan di perangkat dan dikirim saat online.", "success");
      onClose();
      router.refresh();
      return;
    }

    startTransition(async () => {
      const result = initial
        ? await updateTransactionAction(initial.id, input)
        : await createTransactionAction(input);
      if (result.ok) {
        push(result.message ?? "Transaksi disimpan");
        onClose();
        router.refresh();
      } else {
        setError(result.message ?? "Transaksi gagal disimpan.");
      }
    });
  }

  const modes: Array<{ value: Mode; label: string }> = [
    { value: "expense", label: "Keluar" },
    { value: "income", label: "Masuk" },
    { value: "transfer", label: "Transfer" },
  ];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Ubah transaksi" : "Tambah transaksi"}
      footer={
        <Button onClick={submit} loading={pending} type="button">
          {initial ? "Simpan perubahan" : "Simpan transaksi"}
        </Button>
      }
    >
      <div role="group" aria-label="Jenis transaksi" className="grid grid-cols-3 gap-1 rounded-btn bg-muted p-1">
        {modes.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMode(item.value)}
            aria-pressed={mode === item.value}
            className={cn(
              "h-11 rounded-[8px] text-[14px] leading-5 font-semibold transition-[background-color,color,box-shadow] duration-150 ease-out",
              mode === item.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[13px] font-medium text-muted-foreground">Nominal</p>
        <p aria-live="polite" className="sr-only">
          {formatRupiah(amount)}
        </p>
        <p
          key={digits}
          aria-hidden
          className={cn(
            "animate-amount num mt-1 text-[40px] font-bold leading-[44px] tracking-display",
            digits ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {formatRupiah(amount)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "back"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            aria-label={key === "back" ? "Hapus angka" : key}
            className="flex h-12 items-center justify-center rounded-btn border border-border bg-card text-[18px] leading-6 font-semibold text-foreground transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
          >
            {key === "back" ? <Delete className="size-5" aria-hidden /> : key}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {mode === "transfer" ? (
          <>
            <Field label="Dari dompet" htmlFor="from-wallet">
              <Select id="from-wallet" value={walletId} onChange={(event) => setWalletId(event.target.value)}>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ke dompet" htmlFor="to-wallet">
              <Select id="to-wallet" value={toWalletId} onChange={(event) => setToWalletId(event.target.value)}>
                {wallets
                  .filter((wallet) => wallet.id !== walletId)
                  .map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
              </Select>
            </Field>
          </>
        ) : (
          <>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-muted-foreground">Kategori</p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    aria-pressed={categoryId === category.id}
                    className={cn(
                      "flex h-11 shrink-0 items-center gap-2 rounded-btn border px-3 text-[14px] leading-5 font-medium transition-colors duration-150 ease-out",
                      categoryId === category.id
                        ? "border-primary bg-secondary text-secondary-foreground"
                        : "border-border text-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Dompet" htmlFor="wallet">
              <Select id="wallet" value={walletId} onChange={(event) => setWalletId(event.target.value)}>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal" htmlFor="occurred-at">
            <Input
              id="occurred-at"
              type="date"
              value={occurredAt}
              max={todayKey()}
              onChange={(event) => setOccurredAt(event.target.value)}
            />
          </Field>
          <Field label="Catatan" htmlFor="note">
            <Input
              id="note"
              value={note}
              maxLength={200}
              placeholder="Opsional"
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>

        {initial ? null : (
          <a
            href="/scan"
            className="flex h-12 items-center justify-center gap-2 rounded-btn border border-border text-[14px] leading-5 font-semibold text-foreground"
          >
            <Camera className="size-5" aria-hidden /> Scan struk
          </a>
        )}

        {error ? (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}

export function QuickAddButton({
  wallets,
  categories,
  label = "Tambah transaksi",
}: {
  wallets: Wallet[];
  categories: Category[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Check className="size-4" aria-hidden /> {label}
      </Button>
      <TransactionSheet
        open={open}
        onClose={() => setOpen(false)}
        wallets={wallets}
        categories={categories}
      />
    </>
  );
}
