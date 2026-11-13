import { requireUser } from "@/lib/session";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { OfflineSync } from "@/components/offline-sync";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <main className="flex-1 px-4 pt-4 pb-[calc(84px+env(safe-area-inset-bottom))]">
        <OfflineSync />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
