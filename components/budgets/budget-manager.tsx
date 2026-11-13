"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Select } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { BudgetBar } from "@/components/ui/budget-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { saveBudgetAction, deleteBudgetAction } from "@/app/actions/settings";
import { formatRupiah, parseAmountInput } from "@/lib/money";
import type { BudgetProgress } from "@/lib/services/finance";
import type { Category } from "@/lib/types";

export function BudgetManager({
  month,
  progress,
  categories,
}: {
  month: string;
  progress: BudgetProgress[];
  categories: Category[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<BudgetProgress | null>(null);

  const expenseCategories = categories.filter((category) => category.type === "expense");
  const editingCategoryId = editingId
    ? progress.find((item) => item.budget.id === editingId)?.budget.categoryId
    : undefined;
  const available = expenseCategories.filter(
    (category) =>
      !progress.some((item) => item.budget.categoryId === category.id) ||
      category.id === editingCategoryId,
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!editingId) {
      setCategoryId(available[0]?.id ?? "");
      setDigits("");
    }
  }, [open, editingId]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAdd() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(item: BudgetProgress) {
    setEditingId(item.budget.id);
    setCategoryId(item.budget.categoryId);
    setDigits(String(item.budget.limitAmount));
    setOpen(true);
  }

  function submit() {
    setError(null);
    const amount = parseAmountInput(digits);
    if (!categoryId) {
      setError("Pilih kategori.");
      return;
    }
    if (amount <= 0) {
      setError("Nominal anggaran harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await saveBudgetAction({ categoryId, month, limitAmount: amount });
      if (result.ok) {
        push(result.message ?? "Anggaran disimpan");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message ?? "Anggaran gagal disimpan.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={openAdd}>
        <Plus className="size-5" aria-hidden /> Atur anggaran
      </Button>

      {progress.length === 0 ? (
        <EmptyState
          icon={Target}
          message="Belum ada anggaran bulan ini. Tetapkan batas per kategori agar pengeluaran lebih terkendali."
          actionLabel="Atur anggaran"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-2">
          {progress.map((item) => (
            <Panel key={item.budget.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[16px] font-medium text-foreground">
                    {item.category?.name ?? "Tanpa kategori"}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Sisa {formatRupiah(Math.max(0, item.remaining))}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="h-9 rounded-[8px] px-2 text-[13px] font-semibold text-primary hover:bg-accent"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus anggaran ${item.category?.name ?? ""}`}
                    onClick={() => setDeleting(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-[8px] text-destructive hover:bg-expense-soft"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <BudgetBar
                percent={item.percent}
                state={item.state}
                spent={item.spent}
                limit={item.budget.limitAmount}
              />
              {item.state === "over" ? (
                <p className="mt-1 text-[13px] text-destructive">
                  Anggaran {item.category?.name} terlampaui {formatRupiah(Math.abs(item.remaining))}.
                </p>
              ) : item.state === "warning" ? (
                <p className="mt-1 text-[13px] text-warn-text">
                  Anggaran {item.category?.name} terpakai {Math.round(item.percent)}%. Sisa{" "}
                  {formatRupiah(Math.max(0, item.remaining))}.
                </p>
              ) : null}
            </Panel>
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Ubah anggaran" : "Atur anggaran"}
        footer={
          <Button onClick={submit} loading={pending}>
            Simpan anggaran
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Kategori" htmlFor="budget-category">
            <Select
              id="budget-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {available.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Batas anggaran" htmlFor="budget-amount">
            <Input
              id="budget-amount"
              inputMode="numeric"
              value={digits ? formatRupiah(parseAmountInput(digits)).replace("Rp ", "") : ""}
              onChange={(event) => setDigits(parseAmountInput(event.target.value).toString())}
              placeholder="0"
            />
          </Field>
          {error ? (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </Sheet>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus anggaran ini?"
        description="Batas anggaran kategori ini akan dihapus untuk bulan berjalan. Transaksi tidak terpengaruh."
        loading={pending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          startTransition(async () => {
            const result = await deleteBudgetAction(deleting.budget.id);
            push(result.message ?? "", result.ok ? "success" : "error");
            setDeleting(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
