"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { MonthSwitcher } from "@/components/month-switcher";
import type { Category, Wallet } from "@/lib/types";

export function TransactionFilters({
  month,
  wallets,
  categories,
}: {
  month: string;
  wallets: Wallet[];
  categories: Category[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");

  useEffect(() => {
    setSearch(params.get("q") ?? "");
  }, [params]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/transactions?${next.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <MonthSwitcher month={month} basePath="/transactions" />
        <button
          type="button"
          onClick={() => update("month", "all")}
          className="h-11 px-2 text-[14px] font-semibold text-primary"
        >
          Semua waktu
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          update("q", search.trim());
        }}
        role="search"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari catatan atau merchant"
            aria-label="Cari transaksi"
            className="pl-9"
          />
        </div>
      </form>

      <div className="grid grid-cols-3 gap-2">
        <Select
          aria-label="Filter dompet"
          value={params.get("wallet") ?? ""}
          onChange={(event) => update("wallet", event.target.value)}
        >
          <option value="">Semua dompet</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter kategori"
          value={params.get("category") ?? ""}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter jenis"
          value={params.get("type") ?? ""}
          onChange={(event) => update("type", event.target.value)}
        >
          <option value="">Semua jenis</option>
          <option value="income">Masuk</option>
          <option value="expense">Keluar</option>
          <option value="transfer">Transfer</option>
        </Select>
      </div>
    </div>
  );
}
