import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isDemoMode } from "@/lib/db";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <p className="text-[13px] font-medium text-primary">Keuangan</p>
        <h1 className="mt-1 text-[24px] font-bold leading-[30px] tracking-display text-foreground">
          Catat uang dalam hitungan detik
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Kelola dompet, anggaran, dan laporan bulanan dalam satu tempat.
        </p>
      </div>
      {isDemoMode ? (
        <p className="mb-4 rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo aktif tanpa database. Isi <code>DATABASE_URL</code> dan{" "}
          <code>BETTER_AUTH_SECRET</code> untuk mengaktifkan autentikasi.
        </p>
      ) : null}
      {children}
    </div>
  );
}
