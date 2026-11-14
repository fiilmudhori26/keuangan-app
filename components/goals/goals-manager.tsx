"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Minus,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";
import { GoalIconBadge } from "@/components/goals/goal-icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Select } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DatePickerSheet } from "@/components/ui/date-picker-sheet";
import { Confetti } from "@/components/ui/confetti";
import { MaskedAmount } from "@/components/ui/hide-balance";
import { useToast } from "@/components/ui/toast";
import {
  createGoalAction,
  deleteGoalAction,
  addContributionAction,
} from "@/app/actions/goals";
import { formatRupiah, parseAmountInput } from "@/lib/money";
import { formatDateKey, todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GOAL_ICONS, type SavingsGoal } from "@/lib/types";
import type { GoalState } from "@/lib/services/goals";

export type GoalItem = {
  goal: SavingsGoal;
  saved: number;
  percent: number;
  state: GoalState;
};

const ICON_OPTIONS = GOAL_ICONS;
const DEFAULT_GOAL_COLOR = "#0B7A4B";

function GoldProgressBar({ percent, reached }: { percent: number; reached: boolean }) {
  const width = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
      <div
        className={cn(
          "animate-bar h-full rounded-full transition-[width] duration-[var(--motion-base)] ease-out",
          reached ? "bg-gold" : "bg-primary",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function GoalsManager({ items }: { items: GoalItem[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  // Sheet "Tambah target"
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetDigits, setTargetDigits] = useState("");
  const [icon, setIcon] = useState("Target");
  const [addError, setAddError] = useState<string | null>(null);

  // Sheet "Setor" / "Tarik"
  const [contribGoal, setContribGoal] = useState<GoalItem | null>(null);
  const [withdraw, setWithdraw] = useState(false);
  const [amountDigits, setAmountDigits] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(todayKey());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [contribError, setContribError] = useState<string | null>(null);

  // Menu & hapus
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<GoalItem | null>(null);

  // Confetti milestone (hanya transisi → reached lewat form, sekali per goal per sesi)
  const celebratedRef = useRef(new Set<string>());
  const [confettiNonce, setConfettiNonce] = useState(0);

  function openAdd() {
    setName("");
    setTargetDigits("");
    setIcon("Target");
    setAddError(null);
    setAddOpen(true);
  }

  function openContrib(item: GoalItem) {
    setContribGoal(item);
    setWithdraw(false);
    setAmountDigits("");
    setNote("");
    setOccurredAt(todayKey());
    setContribError(null);
  }

  function submitCreate() {
    setAddError(null);
    const targetAmount = parseAmountInput(targetDigits);
    if (!name.trim()) {
      setAddError("Nama target wajib diisi.");
      return;
    }
    if (targetAmount <= 0) {
      setAddError("Target harus lebih dari 0.");
      return;
    }
    startTransition(async () => {
      const result = await createGoalAction({
        name: name.trim(),
        targetAmount,
        icon,
        color: DEFAULT_GOAL_COLOR,
      });
      if (result.ok) {
        push(result.message ?? "Target tabungan dibuat");
        setAddOpen(false);
        router.refresh();
      } else {
        setAddError(result.message ?? "Target gagal disimpan.");
      }
    });
  }

  function submitContribution() {
    if (!contribGoal) return;
    setContribError(null);
    const parsed = parseAmountInput(amountDigits);
    if (parsed <= 0) {
      setContribError("Nominal harus lebih dari 0.");
      return;
    }
    const amount = withdraw ? -parsed : parsed;
    const before = contribGoal;
    startTransition(async () => {
      const result = await addContributionAction({
        goalId: before.goal.id,
        amount,
        occurredAt,
        note: note.trim() || undefined,
      });
      if (result.ok) {
        // Milestone reached: hanya bila setoran positif memindahkan goal
        // dari belum tercapai → tercapai, dan belum pernah dirayakan.
        if (
          amount > 0 &&
          before.state !== "reached" &&
          before.saved + amount >= before.goal.targetAmount &&
          !celebratedRef.current.has(before.goal.id)
        ) {
          celebratedRef.current.add(before.goal.id);
          setConfettiNonce((nonce) => nonce + 1);
        }
        push(result.message ?? (withdraw ? "Penarikan tercatat" : "Setoran tercatat"));
        setContribGoal(null);
        router.refresh();
      } else {
        setContribError(result.message ?? "Setoran gagal disimpan.");
      }
    });
  }

  const reachedCount = items.filter((item) => item.state === "reached").length;

  return (
    <div className="space-y-3">
      <Confetti fireNonce={confettiNonce} />

      <Button onClick={openAdd}>
        <Plus className="size-5" aria-hidden /> Tambah target
      </Button>

      {items.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          message="Buat target tabungan pertamamu. Sisihkan dana sedikit demi sedikit sampai tercapai."
          actionLabel="Buat target tabungan"
          onAction={openAdd}
        />
      ) : (
        <>
          {reachedCount > 0 ? (
            <p className="text-[13px] text-muted-foreground">
              <span className="num">{reachedCount}</span> dari{" "}
              <span className="num">{items.length}</span> target tercapai.
            </p>
          ) : null}
          <ul className="space-y-2">
            {items.map((item) => {
              const { goal, saved, percent, state } = item;
              const reached = state === "reached";
              const remaining = Math.max(0, goal.targetAmount - saved);
              return (
                <li key={goal.id}>
                  <Panel className="p-4">
                    <div className="flex items-start gap-3">
                      <GoalIconBadge icon={goal.icon} color={goal.color} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold text-foreground">
                              {goal.name}
                            </p>
                            <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">
                              Terkumpul{" "}
                              <MaskedAmount className="font-medium text-foreground">
                                {formatRupiah(saved)}
                              </MaskedAmount>{" "}
                              dari{" "}
                              <MaskedAmount className="num">
                                {formatRupiah(goal.targetAmount)}
                              </MaskedAmount>
                            </p>
                          </div>
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              aria-label={`Opsi untuk target ${goal.name}`}
                              aria-haspopup="menu"
                              aria-expanded={menuId === goal.id}
                              onClick={() => setMenuId(menuId === goal.id ? null : goal.id)}
                              className="flex size-11 items-center justify-center rounded-[10px] text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
                            >
                              <MoreHorizontal className="size-5" aria-hidden />
                            </button>
                            {menuId === goal.id ? (
                              <>
                                <button
                                  type="button"
                                  aria-label="Tutup menu"
                                  className="fixed inset-0 z-10 cursor-default"
                                  onClick={() => setMenuId(null)}
                                />
                                <div
                                  role="menu"
                                  className="animate-pop-in absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-[12px] border border-border bg-surface-raised py-1 shadow-sm"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setMenuId(null);
                                      setDeleting(item);
                                    }}
                                    className="flex min-h-[44px] w-full items-center gap-2 px-3 text-[14px] font-medium text-destructive transition-colors duration-150 ease-out hover:bg-expense-soft"
                                  >
                                    <Trash2 className="size-4" aria-hidden /> Hapus
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <p className="num text-[28px] font-bold leading-8 tracking-display text-foreground">
                            {Math.round(percent)}
                            <span className="text-[18px]">%</span>
                          </p>
                          {reached ? (
                            <span className="inline-flex items-center gap-1 rounded-[10px] bg-gold-soft px-2 py-1 text-[12px] font-semibold leading-4 text-gold-text">
                              <Check className="size-3.5" aria-hidden /> Tercapai
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2">
                          <GoldProgressBar percent={percent} reached={reached} />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="min-w-0 text-[13px] leading-[18px] text-muted-foreground">
                            {reached ? (
                              <span className="font-medium text-gold-text">Target tercapai. Mantap!</span>
                            ) : (
                              <>
                                Sisa{" "}
                                <MaskedAmount className="num font-medium text-foreground">
                                  {formatRupiah(remaining)}
                                </MaskedAmount>
                              </>
                            )}
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shrink-0"
                            onClick={() => openContrib(item)}
                          >
                            <Plus className="size-4" aria-hidden /> Setor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Sheet: Tambah target */}
      <Sheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah target tabungan"
        footer={
          <Button onClick={submitCreate} loading={pending}>
            Simpan target
          </Button>
        }
      >
        <div className="space-y-3">
          <Field label="Nama target" htmlFor="goal-name">
            <Input
              id="goal-name"
              value={name}
              maxLength={60}
              placeholder="Mis. Dana liburan"
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Target (Rp)" htmlFor="goal-target">
            <Input
              id="goal-target"
              inputMode="numeric"
              value={targetDigits ? formatRupiah(parseAmountInput(targetDigits)).replace("Rp ", "") : ""}
              onChange={(event) =>
                setTargetDigits(parseAmountInput(event.target.value).toString())
              }
              placeholder="0"
            />
          </Field>
          <Field label="Ikon" htmlFor="goal-icon">
            <Select id="goal-icon" value={icon} onChange={(event) => setIcon(event.target.value)}>
              {ICON_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "TrendingUp" ? "Tren naik" : option === "GraduationCap" ? "Pendidikan" :
                    option === "PiggyBank" ? "Celengan" : option === "Home" ? "Rumah" : "Target"}
                </option>
              ))}
            </Select>
          </Field>
          {addError ? (
            <p role="alert" className="text-[13px] text-destructive">
              {addError}
            </p>
          ) : null}
        </div>
      </Sheet>

      {/* Sheet: Setor / Tarik */}
      <Sheet
        open={contribGoal !== null}
        onClose={() => setContribGoal(null)}
        title={
          contribGoal
            ? `${withdraw ? "Tarik dari" : "Setor ke"} ${contribGoal.goal.name}`
            : ""
        }
        footer={
          <Button onClick={submitContribution} loading={pending}>
            {withdraw ? "Tarik dana" : "Simpan setoran"}
          </Button>
        }
      >
        {contribGoal ? (
          <div className="space-y-3">
            <Field label="Nominal (Rp)" htmlFor="contrib-amount">
              <Input
                id="contrib-amount"
                inputMode="numeric"
                autoFocus
                value={amountDigits ? formatRupiah(parseAmountInput(amountDigits)).replace("Rp ", "") : ""}
                onChange={(event) =>
                  setAmountDigits(parseAmountInput(event.target.value).toString())
                }
                placeholder="0"
              />
            </Field>
            {!withdraw ? (
              <div className="flex gap-2">
                {[1_000_000, 500_000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() =>
                      setAmountDigits((parseAmountInput(amountDigits) + quick).toString())
                    }
                    className="h-11 rounded-btn border border-border px-4 text-[14px] leading-5 font-semibold text-foreground transition-colors duration-150 ease-out hover:bg-muted"
                  >
                    +{quick === 1_000_000 ? "1 jt" : "500 rb"}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal" htmlFor="contrib-date">
                <button
                  id="contrib-date"
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setDatePickerOpen(true)}
                  className="flex h-12 w-full items-center gap-2 rounded-[10px] border border-input bg-card px-3.5 text-left text-[16px] text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Calendar className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="num">{formatDateKey(occurredAt)}</span>
                </button>
              </Field>
              <Field label="Catatan" htmlFor="contrib-note">
                <Input
                  id="contrib-note"
                  value={note}
                  maxLength={200}
                  placeholder="Opsional"
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
            </div>
            <button
              type="button"
              aria-pressed={withdraw}
              onClick={() => setWithdraw((value) => !value)}
              className="flex h-11 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-semibold text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
            >
              <Minus className="size-4" aria-hidden />
              {withdraw ? "Kembali menyetor" : "Tarik dana dari target"}
            </button>
            {contribError ? (
              <p role="alert" className="text-[13px] text-destructive">
                {contribError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Sheet>
      <DatePickerSheet
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        value={occurredAt}
        onChange={setOccurredAt}
        max={todayKey()}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus target tabungan?"
        description={
          deleting
            ? `Target "${deleting.goal.name}" beserta seluruh riwayat setorannya akan dihapus. Saldo dompet tidak terpengaruh.`
            : ""
        }
        loading={pending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          startTransition(async () => {
            const result = await deleteGoalAction(deleting.goal.id);
            push(result.message ?? "", result.ok ? "success" : "error");
            setDeleting(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
