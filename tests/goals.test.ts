import { describe, expect, it } from "vitest";
import { goalProgress, sortedGoals } from "@/lib/services/goals";
import type { GoalContribution, SavingsGoal } from "@/lib/types";

const goal: SavingsGoal = {
  id: "goal_test",
  userId: "user-test",
  name: "Dana darurat",
  targetAmount: 10_000_000,
  icon: "PiggyBank",
  color: "#0B7A4B",
  createdAt: "2026-09-01T00:00:00.000Z",
};

function contribution(amount: number, id: string): GoalContribution {
  return {
    id,
    userId: goal.userId,
    goalId: goal.id,
    amount,
    occurredAt: "2026-11-10",
    note: null,
    createdAt: "2026-11-10T00:00:00.000Z",
  };
}

describe("goalProgress", () => {
  it("menjumlahkan contributions (signed) milik goal saja", () => {
    const contributions = [
      contribution(2_500_000, "c1"),
      contribution(1_000_000, "c2"),
      contribution(700_000, "c3"),
      contribution(-250_000, "c4"),
      { ...contribution(999_000_000, "c5"), goalId: "goal_lain" },
    ];
    const progress = goalProgress(goal, contributions);
    expect(progress.saved).toBe(3_950_000);
    expect(progress.percent).toBeCloseTo(39.5);
    expect(progress.state).toBe("ok");
  });

  it("state near saat >= 80% dan reached saat >= 100%", () => {
    const near = goalProgress(goal, [contribution(8_500_000, "c1")]);
    expect(near.state).toBe("near");
    expect(near.percent).toBeCloseTo(85);

    const reached = goalProgress(goal, [
      contribution(6_000_000, "c1"),
      contribution(5_000_000, "c2"),
    ]);
    expect(reached.state).toBe("reached");
    expect(reached.saved).toBe(11_000_000);
    expect(reached.percent).toBeGreaterThanOrEqual(100);
  });
});

describe("sortedGoals", () => {
  it("meletakkan goal reached di bawah, sisanya urut createdAt", () => {
    const base = { ...goal };
    const goals = [
      { ...base, id: "a", createdAt: "2026-10-01T00:00:00.000Z", state: "reached" as const },
      { ...base, id: "b", createdAt: "2026-11-01T00:00:00.000Z", state: "ok" as const },
      { ...base, id: "c", createdAt: "2026-09-01T00:00:00.000Z", state: "near" as const },
    ];
    expect(sortedGoals(goals).map((g) => g.id)).toEqual(["c", "b", "a"]);
  });
});
