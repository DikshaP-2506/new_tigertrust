import { WalletFeatures } from "./types";
import { getWalletTxStats } from "./solanaClient";
import { getTokenAccountStats } from "./solanaClient";

export async function buildFeatures(wallet: string): Promise<WalletFeatures> {
const stats = await getWalletTxStats(wallet);
const assets = await getTokenAccountStats(wallet);

return {
txCount: stats.txCount,
walletAgeDays: stats.walletAgeDays,
nftCount: assets.nftCount,
successfulRepayments: 0,
defaults: 0,
humanVerified: false,
tokenCount: assets.tokenCount,
hasVC: assets.tokenCount > 0

};
}
