"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Plus, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Select } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionSheet } from "@/components/transactions/transaction-sheet";
import { createWalletAction, updateWalletAction, archiveWalletAction } from "@/app/actions/wallets";
import { formatRupiah, parseAmountInput } from "@/lib/money";
import { WALLET_TYPE_LABELS, WALLET_TYPE_ICONS, type Category, type Wallet, type WalletType } from "@/lib/types";
import type { WalletWithBalance } from "@/lib/services/finance";
import { cn } from "@/lib/utils";

const COLORS = ["#0B7A4B", "#2F6FDE", "#C98A0B", "#7C5CD6", "#0E9AA7", "#D6457A", "#64748B", "#E0622D"];

export function WalletManager({
  wallets,
  categories,
}: {
  wallets: WalletWithBalance[];
  categories: Category[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [archiving, setArchiving] = useState<Wallet | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [balanceDigits, setBalanceDigits] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formOpen) return;
    setName(editing?.name ?? "");
    setType(editing?.type ?? "cash");
    setBalanceDigits(editing ? String(editing.initialBalance) : "");
    setColor(editing?.color ?? COLORS[0]);
    setError(null);
  }, [formOpen, editing]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(wallet: Wallet) {
    setEditing(wallet);
    setFormOpen(true);
  }

  function submit() {
    setError(null);
    const payload = {
      name: name.trim(),
      type,
      initialBalance: parseAmountInput(balanceDigits),
      color,
      icon: WALLET_TYPE_ICONS[type],
      isArchived: false,
    } as const;
    if (!payload.name) {
      setError("Nama dompet wajib diisi.");
      return;
    }
    startTransition(async () => {
      const result = editing
        ? await updateWalletAction(editing.id, { ...payload })
        : await createWalletAction({ ...payload });
      if (result.ok) {
        push(result.message ?? "Dompet disimpan");
        setFormOpen(false);
        router.refresh();
      } else {
        setError(result.message ?? "Dompet gagal disimpan.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={openAdd}>
          <Plus className="size-5" aria-hidden /> Tambah dompet
        </Button>
        <Button variant="secondary" onClick={() => setTransferOpen(true)}>
          <ArrowLeftRight className="size-4" aria-hidden /> Transfer
        </Button>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          message="Tambahkan dompet untuk mulai mencatat."
          actionLabel="Tambah dompet"
          onAction={openAdd}
        />
      ) : (
        <ul className="space-y-2">
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              <Panel className="flex items-center gap-3 p-4">
                <span
                  aria-hidden
                  className="size-10 shrink-0 rounded-full"
                  style={{ backgroundColor: wallet.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-medium text-foreground">{wallet.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {WALLET_TYPE_LABELS[wallet.type]} · saldo awal {formatRupiah(wallet.initialBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-[16px] font-semibold text-foreground">
                    {formatRupiah(wallet.balance)}
                  </p>
                  <div className="mt-1 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(wallet)}
                      className="h-9 rounded-[8px] px-2 text-[13px] font-semibold text-primary hover:bg-accent"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchiving(wallet)}
                      className="h-9 rounded-[8px] px-2 text-[13px] font-semibold text-destructive hover:bg-expense-soft"
                    >
                      Arsip
                    </button>
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Ubah dompet" : "Tambah dompet"}
        footer={
          <Button onClick={submit} loading={pending}>
            {editing ? "Simpan perubahan" : "Tambah dompet"}
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Nama dompet" htmlFor="wallet-name">
            <Input
              id="wallet-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              placeholder="Misalnya Tunai, BCA, GoPay"
            />
          </Field>
          <Field label="Jenis" htmlFor="wallet-type">
            <Select id="wallet-type" value={type} onChange={(event) => setType(event.target.value as WalletType)}>
              {Object.entries(WALLET_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Saldo awal" htmlFor="wallet-balance" hint="Nominal penuh rupiah, tanpa desimal.">
            <Input
              id="wallet-balance"
              inputMode="numeric"
              value={balanceDigits ? formatRupiah(parseAmountInput(balanceDigits)).replace("Rp ", "") : ""}
              onChange={(event) => setBalanceDigits(parseAmountInput(event.target.value).toString())}
              placeholder="0"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-muted-foreground">Warna</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={`Warna ${option}`}
                  aria-pressed={color === option}
                  className={cn(
                    "size-11 rounded-full border-2",
                    color === option ? "border-foreground" : "border-transparent",
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </Sheet>

      <ConfirmDialog
        open={!!archiving}
        title="Arsipkan dompet ini?"
        description="Dompet dan riwayat transaksinya tetap tersimpan, tetapi tidak muncul di pilihan baru."
        confirmLabel="Arsipkan"
        loading={pending}
        onClose={() => setArchiving(null)}
        onConfirm={() => {
          if (!archiving) return;
          startTransition(async () => {
            const result = await archiveWalletAction(archiving.id);
            push(result.message ?? "", result.ok ? "success" : "error");
            setArchiving(null);
            router.refresh();
          });
        }}
      />

      <TransactionSheet
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        wallets={wallets}
        categories={categories}
        defaultMode="transfer"
      />
    </div>
  );
}
