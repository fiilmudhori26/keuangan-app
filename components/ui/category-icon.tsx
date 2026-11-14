import {
  Briefcase,
  Bus,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  ReceiptText,
  Shapes,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn, contrastOn } from "@/lib/utils";
import type { Category } from "@/lib/types";

/** Peta nama ikon (string di `category.icon`) ke komponen Lucide. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Bus,
  ShoppingBag,
  ReceiptText,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Shapes,
};

/**
 * Ikon kategori solid: lingkaran penuh `category.color` dengan ikon Lucide
 * filled (`fill="currentColor"`) berwarna kontras (putih / `#262012`).
 * Dekoratif — nama kategori selalu terbaca dari teks di sebelahnya.
 * Lihat design.md §6 "Ikon kategori (solid)".
 */
export function CategoryIcon({
  category,
  size = 40,
  className,
}: {
  category: Category;
  /** Diameter lingkaran dalam px. */
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category.icon] ?? Shapes;
  const iconSize = Math.max(12, Math.round(size * 0.5));

  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: category.color,
        color: contrastOn(category.color),
      }}
    >
      <Icon size={iconSize} strokeWidth={1.5} fill="currentColor" aria-hidden />
    </span>
  );
}
