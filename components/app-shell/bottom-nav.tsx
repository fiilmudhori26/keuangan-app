"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ReceiptText, Plus, Target, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/settings", label: "Lainnya", icon: Settings2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-[64px] max-w-[480px] items-stretch justify-between px-2">
        {items.slice(0, 2).map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}

        <Link
          href="/transactions?add=1"
          aria-label="Tambah transaksi"
          className="relative -top-3 flex size-14 shrink-0 items-center justify-center self-center rounded-full bg-primary text-primary-foreground shadow-sm transition-[filter,transform] duration-150 ease-out hover:brightness-95 active:scale-[0.98] motion-reduce:active:scale-100"
        >
          <Plus className="size-7" aria-hidden />
        </Link>

        {items.slice(2).map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-btn text-[12px] font-medium transition-colors duration-[var(--motion-base)] ease-out",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 items-center justify-center rounded-full transition-colors duration-[var(--motion-base)] ease-out",
          active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        )}
      >
        <Icon
          className="size-6"
          aria-hidden
          strokeWidth={active ? 2.4 : 2}
        />
      </span>
      {label}
    </Link>
  );
}
