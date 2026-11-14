import {
  GraduationCap,
  Home,
  PiggyBank,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { contrastOn } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  Target,
  PiggyBank,
  TrendingUp,
  Home,
  GraduationCap,
};

/** Ikon target tabungan dari nama lucide (fallback Target). */
export function GoalIcon({ name, className }: { name: string; className?: string }) {
  const Icon = GOAL_ICON_MAP[name] ?? Target;
  return <Icon className={className} aria-hidden />;
}

/** Lingkaran solid warna goal berisi ikon (pola sama dengan ikon kategori). */
export function GoalIconBadge({
  icon,
  color,
  size = 48,
  className,
}: {
  icon: string;
  color: string;
  /** Diameter lingkaran dalam px. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        backgroundColor: color,
        color: contrastOn(color),
        width: size,
        height: size,
      }}
    >
      <GoalIcon name={icon} className={size >= 44 ? "size-6" : "size-5"} />
    </span>
  );
}
