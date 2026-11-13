"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionSheet } from "./transaction-sheet";
import type { Category, Wallet } from "@/lib/types";

/** Opens the add sheet when arriving from the "+" nav button (/transactions?add=1). */
export function AddFromQuery({
  wallets,
  categories,
}: {
  wallets: Wallet[];
  categories: Category[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("add") === "1") {
      setOpen(true);
      const next = new URLSearchParams(params.toString());
      next.delete("add");
      router.replace(`/transactions${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
    }
  }, [params, router]);

  return (
    <TransactionSheet
      open={open}
      onClose={() => setOpen(false)}
      wallets={wallets}
      categories={categories}
      initial={null}
    />
  );
}
