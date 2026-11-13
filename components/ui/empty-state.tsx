import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  /** Tautan untuk CTA (dipakai bila aksi berpindah halaman). */
  actionHref?: string;
  /** Callback untuk CTA (dipakai untuk membuka sheet/form). */
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[14px] border border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary"
      >
        <Icon className="size-8" />
      </span>
      <p className="mt-4 max-w-[32ch] text-[16px] leading-6 text-muted-foreground">
        {message}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "primary", size: "auto" }), "mt-5")}
        >
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <Button size="auto" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
