import Link from "next/link";
import { ChevronRight, Target, Tags, Wallet, PiggyBank } from "lucide-react";
import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { isDemoMode } from "@/lib/db";
import { getOrCreateProfile } from "@/lib/services/queries";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { CategoryManager } from "@/components/settings/category-manager";
import { DangerZone } from "@/components/settings/danger-zone";
import { Logo } from "@/components/brand/logo";

const MANAGEMENT_LINKS = [
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "#kategori", label: "Kategori", icon: Tags },
  { href: "/budgets", label: "Anggaran", icon: Target },
  { href: "/goals", label: "Target tabungan", icon: PiggyBank },
];

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, categories] = await Promise.all([
    getOrCreateProfile(user.id, user.name),
    repo.listCategories(user.id),
  ]);

  const displayName = (profile.displayName || user.name).trim();
  const initial = ([...displayName][0] ?? "?").toUpperCase();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] tracking-display text-foreground">Lainnya</h1>
        <p className="text-[13px] text-muted-foreground">Profil, preferensi, dan manajemen.</p>
      </header>

      {isDemoMode ? (
        <p className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo aktif. Data contoh disimpan di memori server dan kembali ke awal saat server
          dimulai ulang.
        </p>
      ) : null}

      <section>
        <SectionHeader title="Profil" />
        <Panel className="space-y-4">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-[24px] font-bold text-primary"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <ProfileForm profile={profile} />
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader title="Preferensi" />
        <Panel>
          <PreferencesForm />
        </Panel>
      </section>

      <section>
        <SectionHeader title="Manajemen" />
        <div className="divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card">
          {MANAGEMENT_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[56px] items-center gap-3 px-4 text-[16px] font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted/40"
            >
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              {label}
              <ChevronRight className="ml-auto size-5 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section id="kategori" className="scroll-mt-4">
        <SectionHeader title="Kategori" />
        <CategoryManager categories={categories} />
      </section>

      <section>
        <SectionHeader title="Tentang" />
        <Panel className="flex items-center gap-4">
          <Logo size={40} showWordmark={false} />
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-foreground">Keuangan</p>
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              Keuangan v0.1 · PWA pencatatan keuangan pribadi
            </p>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader title="Zona berbahaya" />
        <Panel>
          <p className="mb-3 text-[13px] text-muted-foreground">
            Menghapus akun akan menghapus seluruh data keuangan Anda secara permanen.
          </p>
          <DangerZone />
        </Panel>
      </section>
    </div>
  );
}
