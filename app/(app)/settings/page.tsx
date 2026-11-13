import Link from "next/link";
import { ChevronRight, Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { isDemoMode } from "@/lib/db";
import { getOrCreateProfile } from "@/lib/services/queries";
import { Panel, SectionHeader } from "@/components/ui/panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { CategoryManager } from "@/components/settings/category-manager";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, categories] = await Promise.all([
    getOrCreateProfile(user.id, user.name),
    repo.listCategories(user.id),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] text-foreground">Lainnya</h1>
        <p className="text-[13px] text-muted-foreground">Profil, kategori, dan preferensi.</p>
      </header>

      {isDemoMode ? (
        <p className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo aktif. Data contoh disimpan di memori server dan kembali ke awal saat server
          dimulai ulang.
        </p>
      ) : null}

      <Link
        href="/wallets"
        className="flex h-12 items-center gap-3 rounded-[14px] border border-border bg-card px-4 text-[16px] font-medium text-foreground"
      >
        <Wallet className="size-5 text-muted-foreground" aria-hidden />
        Kelola dompet
        <ChevronRight className="ml-auto size-5 text-muted-foreground" aria-hidden />
      </Link>

      <section>
        <SectionHeader title="Profil dan preferensi" />
        <Panel>
          <ProfileForm profile={profile} email={user.email} />
        </Panel>
      </section>

      <section>
        <SectionHeader title="Kategori" />
        <CategoryManager categories={categories} />
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

      <p className="pb-2 text-center text-[12px] text-muted-foreground">
        Keuangan · PWA pencatatan keuangan pribadi
      </p>
    </div>
  );
}
