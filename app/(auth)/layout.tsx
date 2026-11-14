import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isDemoMode } from "@/lib/db";
import { Logo } from "@/components/brand/logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo size={72} showWordmark={false} animate />
        <h1 className="mt-2 text-[24px] font-bold leading-[30px] tracking-display text-foreground">
          Keuangan
        </h1>
        <p className="text-[15px] leading-[22px] text-muted-foreground">
          Catat uangmu dalam hitungan detik
        </p>
      </div>
      {isDemoMode ? (
        <p className="rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[12px] text-warn-text">
          Mode demo aktif tanpa database. Isi <code>DATABASE_URL</code> dan{" "}
          <code>BETTER_AUTH_SECRET</code> untuk mengaktifkan autentikasi.
        </p>
      ) : null}
      <div className="rounded-[14px] border border-border bg-card p-5 sm:p-6">{children}</div>
    </div>
  );
}
