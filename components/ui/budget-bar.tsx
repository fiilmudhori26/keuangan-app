import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/money";

export function BudgetBar({
  percent,
  state,
  showLabel = true,
  spent,
  limit,
}: {
  percent: number;
  state: "ok" | "warning" | "over";
  showLabel?: boolean;
  spent?: number;
  limit?: number;
}) {
  const width = Math.min(100, Math.max(0, percent));
  const color = state === "over" ? "bg-destructive" : state === "warning" ? "bg-warn" : "bg-primary";

  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("animate-bar h-full rounded-full transition-[width] duration-200 ease-out", color)}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel ? (
        <div className="mt-1 flex items-center justify-between text-[13px]">
          <span
            className={cn(
              "flex items-center gap-1",
              state === "over" ? "text-destructive" : state === "warning" ? "text-warn-text" : "text-muted-foreground",
            )}
          >
            {state !== "ok" ? <AlertTriangle className="size-3.5" aria-hidden /> : null}
            {Math.round(percent)}%
          </span>
          {spent !== undefined && limit !== undefined ? (
            <span className="num text-muted-foreground">
              {formatRupiah(spent)} / {formatRupiah(limit)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
