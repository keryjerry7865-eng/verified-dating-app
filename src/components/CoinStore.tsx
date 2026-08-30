import { Coins, X } from 'lucide-react';

type CoinStoreProps = {
  open: boolean;
  onClose: () => void;
  onPurchase: (coins: number, price: number) => void;
};

const tiers = [
  { coins: 50, price: 50, tone: 'border-rose-200 bg-rose-50' },
  { coins: 100, price: 100, tone: 'border-orange-200 bg-orange-50' },
  { coins: 500, price: 500, tone: 'border-amber-200 bg-amber-50' },
];

export default function CoinStore({ open, onClose, onPurchase }: CoinStoreProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">LoveMatch wallet</p><h2 className="mt-1 text-2xl font-black text-gray-900">Get more coins</h2></div>
          <button type="button" onClick={onClose} aria-label="Close coin store" className="rounded-full p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-3">{tiers.map((tier) => <button type="button" key={tier.coins} onClick={() => onPurchase(tier.coins, tier.price)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tier.tone}`}><span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm"><Coins className="h-5 w-5" /></span><span><strong className="block text-gray-900">{tier.coins} Coins</strong><span className="text-xs text-gray-500">Virtual gifting credits</span></span></span><span className="text-lg font-black text-gray-900">₹{tier.price}</span></button>)}</div>
        <p className="mt-4 text-center text-[11px] text-gray-400">Demo purchase: coins are credited instantly to this browser wallet.</p>
      </section>
    </div>
  );
}
