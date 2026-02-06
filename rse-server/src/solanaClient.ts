import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

export async function getWalletTxStats(wallet: string) {
    const pubkey = new PublicKey(wallet);

    const sigs = await connection.getSignaturesForAddress(pubkey, {
        limit: 1000
    });

    const txCount = sigs.length;

    let walletAgeDays = 0;

    if (sigs.length > 0 && sigs[sigs.length - 1].blockTime) {
    const firstTime = sigs[sigs.length - 1].blockTime! * 1000;
    const ageMs = Date.now() - firstTime;
    walletAgeDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    }

    return {
        txCount,
        walletAgeDays
};
}

export async function getTokenAccountStats(wallet: string) {
const pubkey = new PublicKey(wallet);

const accounts = await connection.getParsedTokenAccountsByOwner(
pubkey,
{ programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
);

const tokenCount = accounts.value.length;

const nftLike = accounts.value.filter(a => {
const amt = a.account.data.parsed.info.tokenAmount;
return amt.decimals === 0 && amt.uiAmount === 1;
}).length;

return {
tokenCount,
nftCount: nftLike
};
}

