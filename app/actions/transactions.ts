"use server";

import { revalidatePath } from "next/cache";
import { repo } from "@/lib/data/repo.demo";
import { requireUser } from "@/lib/session";
import {
  transactionSchema,
  transferSchema,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/validation";
import type { TransactionInput } from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
  revalidatePath("/reports");
}

export async function createTransactionAction(input: TransactionInput): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data transaksi.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.createTransaction(user.id, {
    walletId: parsed.data.walletId,
    categoryId: parsed.data.categoryId,
    type: parsed.data.type,
    transferDirection: null,
    amount: parsed.data.amount,
    occurredAt: parsed.data.occurredAt,
    note: parsed.data.note ?? null,
    merchant: parsed.data.merchant ?? null,
    receiptPath: parsed.data.receiptPath ?? null,
    transferGroupId: null,
    source: parsed.data.source,
  });
  revalidateAll();
  return { ok: true, message: "Transaksi disimpan" };
}

export async function updateTransactionAction(
  id: string,
  input: TransactionInput,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data transaksi.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  const existing = await repo.getTransaction(user.id, id);
  if (!existing) return { ok: false, message: "Transaksi tidak ditemukan." };
  if (existing.type === "transfer") {
    return { ok: false, message: "Transfer tidak dapat diubah. Hapus lalu buat ulang." };
  }
  await repo.updateTransaction(user.id, id, {
    walletId: parsed.data.walletId,
    categoryId: parsed.data.categoryId,
    type: parsed.data.type,
    amount: parsed.data.amount,
    occurredAt: parsed.data.occurredAt,
    note: parsed.data.note ?? null,
    merchant: parsed.data.merchant ?? null,
    receiptPath: parsed.data.receiptPath ?? null,
    source: parsed.data.source,
  });
  revalidateAll();
  return { ok: true, message: "Transaksi diperbarui" };
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const deleted = await repo.deleteTransaction(user.id, id);
  revalidateAll();
  return deleted
    ? { ok: true, message: "Transaksi dihapus" }
    : { ok: false, message: "Transaksi tidak ditemukan." };
}

export async function createTransferAction(input: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  occurredAt: string;
  note?: string;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data transfer.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  const [from, to] = await Promise.all([
    repo.getWallet(user.id, parsed.data.fromWalletId),
    repo.getWallet(user.id, parsed.data.toWalletId),
  ]);
  if (!from || !to) return { ok: false, message: "Dompet tidak ditemukan." };

  await repo.createTransfer(user.id, {
    fromWalletId: parsed.data.fromWalletId,
    toWalletId: parsed.data.toWalletId,
    amount: parsed.data.amount,
    occurredAt: parsed.data.occurredAt,
    note: parsed.data.note,
  });
  revalidateAll();
  return { ok: true, message: "Transfer disimpan" };
}
