export type GiftRecord = {
  id: string;
  gift: string;
  emoji: string;
  coins: number;
  recipientId: string;
  createdAt: string;
};

export type WalletState = {
  coins: number;
  purchasedCoins: number;
  receivedGifts: GiftRecord[];
};

const walletKey = (userId: string) => `lovematch-wallet:${userId}`;

export const readWallet = (userId: string): WalletState => {
  try {
    const raw = window.localStorage.getItem(walletKey(userId));
    const stored = raw ? JSON.parse(raw) as Partial<WalletState> : {};
    return {
      coins: typeof stored.coins === 'number' ? stored.coins : 0,
      purchasedCoins: typeof stored.purchasedCoins === 'number' ? stored.purchasedCoins : 0,
      receivedGifts: Array.isArray(stored.receivedGifts) ? stored.receivedGifts : [],
    };
  } catch {
    return { coins: 0, purchasedCoins: 0, receivedGifts: [] };
  }
};

export const writeWallet = (userId: string, wallet: WalletState) => {
  try {
    window.localStorage.setItem(walletKey(userId), JSON.stringify(wallet));
  } catch {
    // Keep the UI usable when browser storage is unavailable.
  }
};
