"use server";

import { revalidatePath } from "next/cache";
import { repo } from "@/lib/data/repo.demo";
import { requireUser } from "@/lib/session";
import { walletSchema, zodToFieldErrors, type ActionState } from "@/lib/validation";
import type { NewWallet } from "@/lib/data/types";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/transactions");
}

export async function createWalletAction(input: NewWallet): Promise<ActionState> {
  const user = await requireUser();
  const parsed = walletSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali data dompet.", fieldErrors: zodToFieldErrors(parsed.error) };
  }
  await repo.createWallet(user.id, { ...parsed.data, isArchived: false });
  revalidateAll();
  return { ok: true, message: "Dompet ditambahkan" };
}

export async function updateWalletAction(id: string, input: NewWallet): Promise<ActionState> {
  const user = await requireUser();
  const parsed = walletSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali data dompet.", fieldErrors: zodToFieldErrors(parsed.error) };
  }
  await repo.updateWallet(user.id, id, parsed.data);
  revalidateAll();
  return { ok: true, message: "Dompet diperbarui" };
}

export async function archiveWalletAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  await repo.updateWallet(user.id, id, { isArchived: true });
  revalidateAll();
  return { ok: true, message: "Dompet diarsipkan" };
}

