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
  incomeWallet: number;
  upiId: string;
};

const walletKey = (userId: string) => `lovematch-wallet:${userId}`;

export const calculateGiftCommission = (giftValue: number) => Math.round(giftValue * 0.35);

export const readWallet = (userId: string): WalletState => {
  try {
    const raw = window.localStorage.getItem(walletKey(userId));
    const stored = raw ? JSON.parse(raw) as Partial<WalletState> : {};
    return {
      coins: typeof stored.coins === 'number' ? stored.coins : 0,
      purchasedCoins: typeof stored.purchasedCoins === 'number' ? stored.purchasedCoins : 0,
      receivedGifts: Array.isArray(stored.receivedGifts) ? stored.receivedGifts : [],
      incomeWallet: typeof stored.incomeWallet === 'number' ? stored.incomeWallet : 0,
      upiId: typeof stored.upiId === 'string' ? stored.upiId : 'warsi.1@ptaxis',
    };
  } catch {
    return { coins: 0, purchasedCoins: 0, receivedGifts: [], incomeWallet: 0, upiId: 'warsi.1@ptaxis' };
  }
};

export const writeWallet = (userId: string, wallet: WalletState) => {
  try {
    window.localStorage.setItem(walletKey(userId), JSON.stringify(wallet));
  } catch {
    // Keep the UI usable when browser storage is unavailable.
  }
};
