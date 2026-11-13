"use server";

import { revalidatePath } from "next/cache";
import { repo } from "@/lib/data/repo.demo";
import { requireUser } from "@/lib/session";
import { budgetSchema, categorySchema, zodToFieldErrors, type ActionState } from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/categories");
  revalidatePath("/settings");
}

export async function saveBudgetAction(input: {
  id?: string;
  categoryId: string;
  month: string;
  limitAmount: number;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data anggaran.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.upsertBudget(user.id, parsed.data);
  revalidateAll();
  return { ok: true, message: "Anggaran disimpan" };
}

export async function deleteBudgetAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  await repo.deleteBudget(user.id, id);
  revalidateAll();
  return { ok: true, message: "Anggaran dihapus" };
}

export async function createCategoryAction(input: {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.createCategory(user.id, { ...parsed.data, isArchived: false });
  revalidateAll();
  return { ok: true, message: "Kategori ditambahkan" };
}

export async function updateCategoryAction(
  id: string,
  input: { name: string; type: "income" | "expense"; icon: string; color: string },
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data kategori.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.updateCategory(user.id, id, parsed.data);
  revalidateAll();
  return { ok: true, message: "Kategori diperbarui" };
}

export async function archiveCategoryAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  await repo.updateCategory(user.id, id, { isArchived: true });
  revalidateAll();
  return { ok: true, message: "Kategori diarsipkan" };
}
