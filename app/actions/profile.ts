"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/db";
import { repo } from "@/lib/data/repo.demo";
import { requireUser } from "@/lib/session";
import { profileSchema, zodToFieldErrors, type ActionState } from "@/lib/validation";

export async function saveProfileAction(input: {
  displayName: string;
  currency: "IDR";
  monthStartDay: number;
  theme: "system" | "light" | "dark";
}): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali pengaturan.",
      fieldErrors: zodToFieldErrors(parsed.error),
    };
  }
  await repo.saveProfile(user.id, {
    displayName: parsed.data.displayName ?? "",
    currency: parsed.data.currency,
    monthStartDay: parsed.data.monthStartDay,
    theme: parsed.data.theme,
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true, message: "Pengaturan disimpan" };
}

export async function deleteAccountAction(): Promise<ActionState> {
  const user = await requireUser();
  await repo.deleteUserData(user.id);

  if (!isDemoMode && auth) {
    try {
      await auth.api.deleteUser({ headers: await headers(), body: {} });
    } catch {
      // Data is already gone; the auth record cleanup can be retried by support.
    }
  }

  redirect("/login?deleted=1");
}
