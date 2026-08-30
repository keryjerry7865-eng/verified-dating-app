import { Coins, Gift } from 'lucide-react';

export type GiftOption = { name: string; emoji: string; coins: number };

export const giftOptions: GiftOption[] = [
  { name: 'Car', emoji: '🚗', coins: 120 },
  { name: 'Dress', emoji: '👗', coins: 80 },
  { name: 'Rose', emoji: '🌹', coins: 10 },
  { name: 'Head Crown', emoji: '👑', coins: 150 },
  { name: 'Bike', emoji: '🏍️', coins: 100 },
  { name: 'Flowers', emoji: '💐', coins: 35 },
  { name: 'Sparkles', emoji: '✨', coins: 20 },
  { name: 'Hearts', emoji: '💖', coins: 25 },
];

type GiftPanelProps = { coins: number; onSend: (gift: GiftOption) => void; onOpenStore: () => void };

export default function GiftPanel({ coins, onSend, onOpenStore }: GiftPanelProps) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-left">
      <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-black text-gray-900"><Gift className="h-4 w-4 text-rose-500" />Send a gift</span><button type="button" onClick={onOpenStore} className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm"><Coins className="h-3.5 w-3.5" />{coins} coins</button></div>
      <div className="grid grid-cols-4 gap-2">{giftOptions.map((gift) => <button type="button" key={gift.name} onClick={() => onSend(gift)} className="rounded-xl bg-white p-2 text-center shadow-sm ring-1 ring-amber-100 transition hover:-translate-y-0.5 hover:ring-rose-200"><div className="text-2xl">{gift.emoji}</div><div className="mt-1 truncate text-[10px] font-bold text-gray-700">{gift.name}</div><div className="mt-0.5 text-[10px] font-semibold text-amber-600">{gift.coins}</div></button>)}</div>
    </div>
  );
}
