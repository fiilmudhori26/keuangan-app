"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { useToast } from "@/components/ui/toast";
import { createTransactionAction } from "@/app/actions/transactions";
import { parseQuickEntry } from "@/lib/ai/parse-text";
import { formatRupiah, parseAmountInput } from "@/lib/money";
import { todayKey } from "@/lib/date";
import type { Category, Wallet } from "@/lib/types";

type Step = "input" | "review";

type Draft = {
  type: "income" | "expense";
  amount: number;
  occurredAt: string;
  merchant?: string;
  note?: string;
  categoryId: string;
  walletId: string;
  source: "ai_scan" | "ai_text";
  hints: string[];
};

export function ScanFlow({ wallets, categories }: { wallets: Wallet[]; categories: Category[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("input");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categoriesForType = categories.filter((item) => item.type === draft?.type);

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const form = new FormData();
      form.append("receipt", file);
      const response = await fetch("/api/scan", { method: "POST", body: form });
      const payload = (await response.json()) as {
        draft?: { total: number; date?: string; merchant?: string; categoryGuess?: string };
        error?: string;
      };
      if (!response.ok || !payload.draft) {
        setError(payload.error ?? "Struk belum terbaca. Foto ulang atau isi manual.");
        setStep("review");
        setDraft({
          type: "expense",
          amount: 0,
          occurredAt: todayKey(),
          source: "ai_scan",
          categoryId: categories.find((item) => item.type === "expense")?.id ?? "",
          walletId: wallets[0]?.id ?? "",
          hints: ["Hasil AI tidak tersedia. Lengkapi manual sebelum menyimpan."],
        });
        return;
      }
      const guess = payload.draft.categoryGuess?.toLowerCase();
      const category =
        categories.find((item) => item.type === "expense" && item.name.toLowerCase() === guess) ??
        categories.find((item) => item.type === "expense");
      setDraft({
        type: "expense",
        amount: payload.draft.total,
        occurredAt: payload.draft.date ?? todayKey(),
        merchant: payload.draft.merchant,
        note: payload.draft.merchant,
        source: "ai_scan",
        categoryId: category?.id ?? "",
        walletId: wallets[0]?.id ?? "",
        hints: ["Hasil AI masih draf. Periksa total dan kategori sebelum menyimpan."],
      });
      setStep("review");
    } catch {
      setError("Struk gagal diproses. Coba lagi atau isi manual.");
    } finally {
      setLoading(false);
    }
  }

  function handleText() {
    setError(null);
    if (!text.trim()) {
      setError("Tulis transaksi, misalnya: makan siang 25rb gopay.");
      return;
    }
    const parsed = parseQuickEntry(text, categories, wallets, todayKey());
    setDraft({
      ...parsed,
      categoryId: parsed.categoryId ?? categories.find((item) => item.type === parsed.type)?.id ?? "",
      walletId: parsed.walletId ?? wallets[0]?.id ?? "",
      hints: parsed.hints,
    });
    setStep("review");
    setPreview(null);
  }

  function save() {
    if (!draft) return;
    setError(null);
    if (draft.amount <= 0) {
      setError("Nominal belum diisi. Masukkan angka lebih dari 0.");
      return;
    }
    if (!draft.categoryId) {
      setError("Pilih kategori terlebih dahulu.");
      return;
    }
    startTransition(async () => {
      const result = await createTransactionAction({
        type: draft.type,
        amount: draft.amount,
        walletId: draft.walletId,
        categoryId: draft.categoryId,
        occurredAt: draft.occurredAt,
        note: draft.note,
        merchant: draft.merchant,
        source: draft.source,
      });
      if (result.ok) {
        push(result.message ?? "Transaksi disimpan");
        router.push("/transactions");
        router.refresh();
      } else {
        setError(result.message ?? "Transaksi gagal disimpan.");
      }
    });
  }

  if (step === "review" && draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="w-auto" onClick={() => setStep("input")}>
            ← Ulangi
          </Button>
          <p className="text-[13px] text-muted-foreground">
            {draft.source === "ai_scan" ? "Tinjau hasil scan" : "Tinjau hasil input teks"}
          </p>
        </div>

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Pratinjau foto struk"
            className="max-h-56 w-full rounded-[14px] border border-border object-cover"
          />
        ) : null}

        <Panel className="space-y-3">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">Jenis</p>
            <div className="mt-1 grid grid-cols-2 gap-1 rounded-[10px] bg-muted p-1">
              {(["expense", "income"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={draft.type === value}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      type: value,
                      categoryId: categories.find((item) => item.type === value)?.id ?? "",
                    })
                  }
                  className={`h-11 rounded-[8px] text-[14px] font-semibold ${
                    draft.type === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {value === "expense" ? "Keluar" : "Masuk"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Total" htmlFor="draft-total" hint="Nominal penuh rupiah.">
            <Input
              id="draft-total"
              inputMode="numeric"
              value={draft.amount ? formatRupiah(draft.amount).replace("Rp ", "") : ""}
              onChange={(event) =>
                setDraft({ ...draft, amount: parseAmountInput(event.target.value) })
              }
              placeholder="0"
            />
          </Field>

          <Field label="Merchant" htmlFor="draft-merchant">
            <Input
              id="draft-merchant"
              value={draft.merchant ?? ""}
              maxLength={120}
              onChange={(event) => setDraft({ ...draft, merchant: event.target.value })}
              placeholder="Opsional"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal" htmlFor="draft-date">
              <Input
                id="draft-date"
                type="date"
                value={draft.occurredAt}
                max={todayKey()}
                onChange={(event) => setDraft({ ...draft, occurredAt: event.target.value })}
              />
            </Field>
            <Field label="Dompet" htmlFor="draft-wallet">
              <Select
                id="draft-wallet"
                value={draft.walletId}
                onChange={(event) => setDraft({ ...draft, walletId: event.target.value })}
              >
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Kategori" htmlFor="draft-category">
            <Select
              id="draft-category"
              value={draft.categoryId}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
            >
              {categoriesForType.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Catatan" htmlFor="draft-note">
            <Textarea
              id="draft-note"
              value={draft.note ?? ""}
              maxLength={200}
              rows={2}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            />
          </Field>

          <div className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[13px] text-warn-text">
            <p className="font-semibold">Periksa sebelum disimpan</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {draft.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>

          {error ? (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          ) : null}

          <Button onClick={save} loading={pending}>
            Simpan transaksi
          </Button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel className="space-y-3">
        <p className="text-[16px] font-medium text-foreground">Scan struk</p>
        <p className="text-[13px] text-muted-foreground">
          Foto struk akan dibaca otomatis. Hasilnya selalu draf yang harus Anda konfirmasi.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          loading={loading}
          type="button"
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Camera className="size-5" aria-hidden />}
          Ambil atau unggah foto struk
        </Button>
        {error ? (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        ) : null}
      </Panel>

      <Panel className="space-y-3">
        <p className="flex items-center gap-2 text-[16px] font-medium text-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden /> Input teks bebas
        </p>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Contoh: makan siang 25rb gopay"
          aria-label="Tulis transaksi dengan kata-kata"
          rows={2}
        />
        <Button onClick={handleText} type="button">
          Uraikan jadi draf
        </Button>
      </Panel>

      <p className="text-[12px] text-muted-foreground">
        Tanpa kunci AI, scan foto tidak aktif. Input teks tetap bekerja sepenuhnya di perangkat.
      </p>
    </div>
  );
}
