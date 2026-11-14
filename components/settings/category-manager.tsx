"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Select } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  archiveCategoryAction,
  createCategoryAction,
  updateCategoryAction,
} from "@/app/actions/settings";
import type { Category } from "@/lib/types";

const COLORS = ["#0B7A4B", "#2F6FDE", "#C98A0B", "#7C5CD6", "#0E9AA7", "#D6457A", "#64748B", "#E0622D"];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [archiving, setArchiving] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setType(editing?.type ?? "expense");
    setColor(editing?.color ?? COLORS[0]);
    setError(null);
  }, [open, editing]);

  function submit() {
    if (!name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    startTransition(async () => {
      const payload = { name: name.trim(), type, icon: "Shapes", color };
      const result = editing
        ? await updateCategoryAction(editing.id, payload)
        : await createCategoryAction(payload);
      if (result.ok) {
        push(result.message ?? "Kategori disimpan");
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message ?? "Kategori gagal disimpan.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        size="auto"
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        <Plus className="size-4" aria-hidden /> Kategori baru
      </Button>

      <ul className="divide-y divide-border border-y border-border">
        {categories.map((category) => (
          <li key={category.id} className="flex min-h-[52px] items-center gap-3 py-1.5">
            <CategoryIcon category={category} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] text-foreground">{category.name}</p>
              <p className="text-[12px] text-muted-foreground">
                {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing(category);
                setOpen(true);
              }}
              className="h-11 px-2 text-[13px] font-semibold text-primary"
            >
              Ubah
            </button>
            <button
              type="button"
              onClick={() => setArchiving(category)}
              className="h-11 px-2 text-[13px] font-semibold text-destructive"
            >
              Arsip
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Ubah kategori" : "Kategori baru"}
        footer={
          <Button onClick={submit} loading={pending}>
            Simpan kategori
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Nama kategori" htmlFor="category-name">
            <Input
              id="category-name"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Jenis" htmlFor="category-type">
            <Select
              id="category-type"
              value={type}
              onChange={(event) => setType(event.target.value as "income" | "expense")}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </Select>
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-muted-foreground">Warna</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Warna ${option}`}
                  aria-pressed={color === option}
                  onClick={() => setColor(option)}
                  className={`size-11 rounded-full border-2 ${
                    color === option ? "border-foreground" : "border-transparent"
                  }`}
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
        title="Arsipkan kategori ini?"
        description="Kategori tidak muncul di pilihan baru. Transaksi lama tetap tersimpan."
        confirmLabel="Arsipkan"
        loading={pending}
        onClose={() => setArchiving(null)}
        onConfirm={() => {
          if (!archiving) return;
          startTransition(async () => {
            const result = await archiveCategoryAction(archiving.id);
            push(result.message ?? "", result.ok ? "success" : "error");
            setArchiving(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
