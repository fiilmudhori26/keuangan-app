import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { ScanFlow } from "@/components/scan/scan-flow";

export default async function ScanPage() {
  const user = await requireUser();
  const [wallets, categories] = await Promise.all([
    repo.listWallets(user.id),
    repo.listCategories(user.id),
  ]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] text-foreground">Scan struk</h1>
        <p className="text-[13px] text-muted-foreground">
          Ubah foto struk atau kalimat singkat menjadi draf transaksi.
        </p>
      </header>
      <ScanFlow wallets={wallets} categories={categories} />
    </div>
  );
}
