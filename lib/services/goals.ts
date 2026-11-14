import type { GoalContribution, SavingsGoal } from "../types";

export type GoalState = "ok" | "near" | "reached";

export type GoalProgress = {
  /** Total setoran (signed) untuk goal ini; bisa negatif bila penarikan lebih besar. */
  saved: number;
  /** 0..N, boleh melebihi 100. */
  percent: number;
  state: GoalState;
};

export function goalState(percent: number): GoalState {
  if (percent >= 100) return "reached";
  if (percent >= 80) return "near";
  return "ok";
}

/**
 * saved = jumlah amount (signed) seluruh contributions milik `goal`.
 * Contributions yang diteruskan boleh berisi goal lain; hanya yang cocok yang dihitung.
 */
export function goalProgress(
  goal: SavingsGoal,
  contributions: GoalContribution[],
): GoalProgress {
  const saved = contributions
    .filter((c) => c.goalId === goal.id)
    .reduce((total, c) => total + c.amount, 0);
  const percent = goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;
  return { saved, percent, state: goalState(percent) };
}

/**
 * Goal yang sudah "reached" diletakkan di bawah; sisanya urut createdAt menaik.
 * Menerima goal apa pun yang punya `createdAt` dan (opsional) `state`;
 * item tanpa `state` dianggap belum tercapai.
 */
export function sortedGoals<T extends SavingsGoal & { state?: GoalState }>(goals: T[]): T[] {
  return [...goals].sort((a, b) => {
    const aReached = a.state === "reached" ? 1 : 0;
    const bReached = b.state === "reached" ? 1 : 0;
    if (aReached !== bReached) return aReached - bReached;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
