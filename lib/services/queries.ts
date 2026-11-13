import { monthKey, monthRange, shiftMonth } from "../date";
import { repo } from "../data/repo.demo";
import { totalBalance, withBalances, type WalletWithBalance } from "./finance";

export async function getWalletsWithBalances(userId: string): Promise<WalletWithBalance[]> {
  const [wallets, transactions] = await Promise.all([
    repo.listWallets(userId),
    repo.listTransactions(userId, { limit: 5000 }),
  ]);
  return withBalances(wallets, transactions);
}

export async function getBalanceTotal(userId: string): Promise<number> {
  return totalBalance(await getWalletsWithBalances(userId));
}

export async function getOrCreateProfile(userId: string, displayName: string) {
  const profile = await repo.getProfile(userId);
  if (profile) return profile;
  return repo.saveProfile(userId, { displayName });
}

export function currentMonth(): string {
  return monthKey();
}

export function previousMonth(month: string): string {
  return shiftMonth(month, -1);
}

export function rangeOf(month: string) {
  return monthRange(month);
}
