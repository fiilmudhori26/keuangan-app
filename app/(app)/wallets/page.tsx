import { requireUser } from "@/lib/session";
import { repo } from "@/lib/data/repo.demo";
import { getWalletsWithBalances } from "@/lib/services/queries";
import { totalBalance } from "@/lib/services/finance";
import { formatRupiah } from "@/lib/money";
import { WalletManager } from "@/components/wallets/wallet-manager";

export default async function WalletsPage() {
  const user = await requireUser();
  const [wallets, categories] = await Promise.all([
    getWalletsWithBalances(user.id),
    repo.listCategories(user.id),
  ]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[24px] font-bold leading-[30px] tracking-display text-foreground">Dompet</h1>
        <p className="text-[13px] text-muted-foreground">
          Total saldo <span className="num">{formatRupiah(totalBalance(wallets))}</span>
        </p>
      </header>
      <WalletManager wallets={wallets} categories={categories} />
    </div>
  );
}
