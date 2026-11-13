"use client";

import { Eye, EyeOff } from "lucide-react";
import { useHideBalance } from "@/components/ui/hide-balance";

export function BalanceToggle() {
  const [hidden, setHidden] = useHideBalance();
  return (
    <button
      type="button"
      aria-pressed={hidden}
      aria-label={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
      title={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
      onClick={() => setHidden(!hidden)}
      className="flex size-11 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
    >
      {hidden ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
    </button>
  );
}
