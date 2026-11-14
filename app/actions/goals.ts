"use server";

import { revalidatePath } from "next/cache";
import { repo } from "@/lib/data/repo.demo";
import { requireUser } from "@/lib/session";
import {
  contributionSchema,
  goalSchema,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function createGoalAction(input: {
  name: string;
  targetAmount: number;
  icon: string;
  color: string;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data target.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.createGoal(user.id, parsed.data);
  revalidateAll();
  return { ok: true, message: "Target tabungan dibuat" };
}

export async function deleteGoalAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const deleted = await repo.deleteGoal(user.id, id);
  if (!deleted) {
    return { ok: false, message: "Target tabungan tidak ditemukan." };
  }
  revalidateAll();
  return { ok: true, message: "Target tabungan dihapus" };
}

export async function addContributionAction(input: {
  goalId: string;
  amount: number;
  occurredAt: string;
  note?: string;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data setoran.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  // Confetti/pencapaian ditangani di sisi klien setelah action sukses.
  const contribution = await repo.addContribution(user.id, parsed.data);
  if (!contribution) {
    return { ok: false, message: "Target tabungan tidak ditemukan." };
  }
  revalidateAll();
  return { ok: true, message: "Setoran tercatat" };
}
