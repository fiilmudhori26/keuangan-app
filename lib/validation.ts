import { z } from "zod";
import { MAX_AMOUNT } from "./money";

const amount = z
  .number({ error: "Nominal belum diisi." })
  .int("Nominal harus bilangan bulat.")
  .positive("Nominal harus lebih dari 0.")
  .max(MAX_AMOUNT, "Nominal terlalu besar.");

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");

const monthKeySchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Bulan tidak valid.");

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Nama dompet wajib diisi.").max(40),
  type: z.enum(["cash", "bank", "ewallet", "other"]),
  initialBalance: z.number().int().min(0).max(MAX_AMOUNT),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().min(1).max(40),
});
export type WalletInput = z.infer<typeof walletSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(40),
  type: z.enum(["income", "expense"]),
  icon: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount,
  walletId: z.string().min(1, "Pilih dompet."),
  categoryId: z.string().min(1, "Pilih kategori."),
  occurredAt: dateKey,
  note: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  merchant: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
  receiptPath: z.string().max(300).optional(),
  source: z.enum(["manual", "ai_scan", "ai_text"]).default("manual"),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z
  .object({
    fromWalletId: z.string().min(1, "Pilih dompet asal."),
    toWalletId: z.string().min(1, "Pilih dompet tujuan."),
    amount,
    occurredAt: dateKey,
    note: z.string().trim().max(200).optional(),
  })
  .refine((value) => value.fromWalletId !== value.toWalletId, {
    message: "Dompet asal dan tujuan harus berbeda.",
    path: ["toWalletId"],
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Pilih kategori."),
  month: monthKeySchema,
  limitAmount: amount,
});
export type BudgetFormInput = z.infer<typeof budgetSchema>;

export const profileSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  currency: z.literal("IDR"),
  monthStartDay: z.number().int().min(1).max(28),
  theme: z.enum(["system", "light", "dark"]),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export type ActionState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

export function zodToFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
