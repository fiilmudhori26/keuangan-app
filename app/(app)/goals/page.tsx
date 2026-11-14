import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { goalProgress, sortedGoals } from "@/lib/services/goals";
import type { SavingsGoal } from "@/lib/types";
import { GoalsManager, type GoalItem } from "@/components/goals/goals-manager";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await requireUser();
  const [goals, contributions] = await Promise.all([
    repo.listGoals(user.id),
    repo.listContributions(user.id),
  ]);

  // Reached diletakkan di bawah; sisanya urut createdAt menaik.
  const sorted = sortedGoals(
    goals.map((goal) => ({ ...goal, ...goalProgress(goal, contributions) })),
  );

  const items: GoalItem[] = sorted.map(
    ({ saved, percent, state, ...goal }) => ({ goal: goal as SavingsGoal, saved, percent, state }),
  );

  return (
    <div className="animate-fade-up-fast space-y-4">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] tracking-display text-foreground">
          Target tabungan
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Kumpulkan dana untuk tujuanmu, satu setoran tiap kali.
        </p>
      </header>
      <GoalsManager items={items} />
    </div>
  );
}
