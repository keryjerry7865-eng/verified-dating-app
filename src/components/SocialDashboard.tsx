import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarDays, ChevronLeft, Coins, Crown, Gamepad2, Gift, Globe2, Heart, Home, Instagram, MessageCircle, Mic, MoreHorizontal, Music2, Palette, Phone, Play, Plus, Radio, Send, Settings, Share2, ShieldCheck, Sparkles, Trophy, UserRound, Users, Wallet, X, Zap } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { normalizeProfile, readLocalProfile, type LocalProfile } from '../lib/profileFallback';
import { readWallet, writeWallet, type WalletState } from '../lib/wallet';

type SocialDashboardProps = { session: Session; onSignOut: () => void };
type SocialProfile = LocalProfile & { displayName: string };
type Tab = 'home' | 'party' | 'chat' | 'mine';
type Gift = { name: string; price: number; emoji: string; category: 'Gift' | 'Ring' | 'Jewelry'; kind: 'crown' | 'car' | 'flowers' | 'spark' };

const games = ['Truth & Dare', 'Undercover', 'Dominoes', 'Draw & Guess', 'Ludo', 'Snakes & Ladders', 'Carrom'];
const seats = Array.from({ length: 10 }, (_, index) => index + 1);
const gifts: Gift[] = [
  { name: 'Heart Crown', price: 977, emoji: '👑', category: 'Gift', kind: 'crown' },
  { name: 'Ruby Box', price: 12777, emoji: '🎁', category: 'Jewelry', kind: 'spark' },
  { name: 'Royal Purple', price: 2777, emoji: '💜', category: 'Gift', kind: 'spark' },
  { name: 'Star Water', price: 1777, emoji: '💧', category: 'Gift', kind: 'spark' },
  { name: 'Luxury Feast', price: 5777, emoji: '🍱', category: 'Jewelry', kind: 'spark' },
  { name: 'Blazing Kiss', price: 3777, emoji: '💋', category: 'Gift', kind: 'flowers' },
  { name: 'Star Frost Box', price: 7777, emoji: '❄️', category: 'Ring', kind: 'spark' },
  { name: 'Diamond Ring', price: 4999, emoji: '💍', category: 'Ring', kind: 'crown' },
  { name: 'Flower Burst', price: 888, emoji: '💐', category: 'Gift', kind: 'flowers' },
];

const roomThemes = [
  { name: 'Birthday Bash', colors: 'from-fuchsia-800 via-rose-700 to-orange-500', icon: '🎂' },
  { name: 'DJ Club', colors: 'from-indigo-950 via-violet-900 to-fuchsia-700', icon: '🎧' },
  { name: 'Moon Garden', colors: 'from-slate-950 via-cyan-900 to-emerald-700', icon: '🌙' },
];

const gamesForDisplay = games.map((name, index) => ({ name, emoji: ['🎭', '🕵️', '🀄', '🎨', '🎲', '🐍', '🎯'][index] }));

export default function SocialDashboard({ session, onSignOut }: SocialDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [wallet, setWallet] = useState<WalletState>(() => readWallet(session.user.id));
  const [roomTheme, setRoomTheme] = useState(0);
  const [roomName, setRoomName] = useState('Midnight Voice Lounge');
  const [roomId, setRoomId] = useState('LM-2486');
  const [hostMode, setHostMode] = useState(false);
  const [joinedSeats, setJoinedSeats] = useState<number[]>([1, 4, 7]);
  const [activeGame, setActiveGame] = useState('');
  const [giftCategory, setGiftCategory] = useState<Gift['category']>('Gift');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [giftTarget, setGiftTarget] = useState<SocialProfile | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [people, setPeople] = useState<SocialProfile[]>([]);

  const currentUserName = session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Member';
  const theme = roomThemes[roomTheme];
  const visibleGifts = gifts.filter((gift) => gift.category === giftCategory);
  const addAlert = (text: string) => {
    setAlerts((current) => [...current, text]);
    window.setTimeout(() => setAlerts((current) => current.filter((item) => item !== text)), 4500);
  };

  useEffect(() => writeWallet(session.user.id, wallet), [session.user.id, wallet]);

  useEffect(() => {
    const load = async () => {
      const local = readLocalProfile(session.user.id);
      try {
        const { data: own } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        const ownProfile = normalizeProfile(session.user.id, own as Record<string, unknown> | null) || local;
        if (ownProfile) setProfile({ ...ownProfile, displayName: currentUserName });
        const { data: rows } = await supabase.from('profiles').select('*').neq('id', session.user.id).limit(12);
        setPeople((rows || []).map((row) => normalizeProfile(String(row.id), row as Record<string, unknown>)).filter((item): item is LocalProfile => Boolean(item)).map((item) => ({ ...item, displayName: `Member ${item.id.slice(0, 5)}` })));
      } catch {
        if (local) setProfile({ ...local, displayName: currentUserName });
      }
    };
    void load();
  }, [session.user.id, currentUserName]);

  useEffect(() => {
    const channel = supabase.channel(`social-alerts:${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `liked_id=eq.${session.user.id}` }, () => addAlert('New like received'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () => addAlert('You have a new match'))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [session.user.id]);

  const sendGift = (gift: Gift, target: SocialProfile | null = giftTarget) => {
    const recipientName = target?.displayName || 'the room';
    if (wallet.coins < gift.price) {
      setStoreOpen(true);
      addAlert(`You need ${gift.price - wallet.coins} more coins`);
      return;
    }
    setWallet((current) => ({ ...current, coins: current.coins - gift.price, receivedGifts: [...current.receivedGifts, { id: crypto.randomUUID(), gift: gift.name, emoji: gift.emoji, coins: gift.price, recipientId: target?.id || roomId, createdAt: new Date().toISOString() }] }));
    setSelectedGift(gift);
    addAlert(`${gift.name} sent to ${recipientName}`);
  };

  const buyCoins = (amount: number) => {
    setWallet((current) => ({ ...current, coins: current.coins + amount, purchasedCoins: current.purchasedCoins + amount }));
    setStoreOpen(false);
    addAlert(`${amount} coins added to your wallet`);
  };

  const joinSeat = (seat: number) => setJoinedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat]);
  const tabs = useMemo(() => [{ id: 'home' as const, label: 'Home', icon: Home }, { id: 'party' as const, label: 'Party', icon: Radio }, { id: 'chat' as const, label: 'Chat', icon: MessageCircle }, { id: 'mine' as const, label: 'Mine', icon: UserRound }], []);

  return (
    <main className="min-h-screen bg-[#100d1c] pb-24 text-white">
      <AnimatePresence>{alerts.map((alert, index) => <motion.div key={`${alert}-${index}`} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#242035]/95 px-4 py-3 text-sm font-bold shadow-2xl"><Sparkles className="mr-2 inline h-4 w-4 text-amber-300" />{alert}</motion.div>)}</AnimatePresence>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#151123]/90 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-violet-600 shadow-lg"><Heart className="h-5 w-5 fill-white" /></div><span className="text-lg font-black tracking-tight">LoveMatch</span></div><div className="flex items-center gap-2 text-[11px] font-black"><span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1.5 text-violet-200"><Zap className="h-3.5 w-3.5" />{wallet.coins}</span><span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1.5 text-amber-200"><Crown className="h-3.5 w-3.5" />{Math.floor(wallet.purchasedCoins / 10)}</span><button onClick={() => setRechargeOpen(true)} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-black">Recharge</button>{profile?.avatarUrl ? <img src={profile.avatarUrl} alt={currentUserName} className="h-9 w-9 rounded-full object-cover ring-2 ring-rose-300" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-700"><UserRound className="h-4 w-4" /></div>}</div></div></header>

      <div className="mx-auto max-w-6xl px-4 py-5">
        {activeTab === 'home' && <HomeView people={people} onOpenRoom={() => setActiveTab('party')} onInvite={() => setInviteOpen(true)} onTheme={() => setRoomTheme((roomTheme + 1) % roomThemes.length)} />}
        {activeTab === 'party' && <PartyView theme={theme} roomName={roomName} roomId={roomId} hostMode={hostMode} joinedSeats={joinedSeats} activeGame={activeGame} roomMenuOpen={roomMenuOpen} onBack={() => setActiveTab('home')} onHost={() => setHostMode((value) => !value)} onSeat={joinSeat} onGame={setActiveGame} onMenu={() => setRoomMenuOpen((value) => !value)} onInvite={() => setInviteOpen(true)} onGift={(gift) => sendGift(gift)} />}
        {activeTab === 'chat' && <ChatView people={people} onGift={(gift, target) => sendGift(gift, target)} coins={wallet.coins} onStore={() => setStoreOpen(true)} />}
        {activeTab === 'mine' && <MineView profile={profile} wallet={wallet} onRecharge={() => setRechargeOpen(true)} onSignOut={onSignOut} />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#171326]/95 px-3 py-2 backdrop-blur-xl"><div className="mx-auto grid max-w-lg grid-cols-4 gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold ${activeTab === id ? 'bg-rose-500/15 text-rose-300' : 'text-white/45'}`}><Icon className="h-5 w-5" />{label}</button>)}</div></nav>

      <CoinStoreModal open={storeOpen} onClose={() => setStoreOpen(false)} onPurchase={buyCoins} />
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} onPurchase={() => { buyCoins(1000); setRechargeOpen(false); }} />
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} people={people} />
      <GiftOverlay gift={selectedGift} onClose={() => setSelectedGift(null)} />
    </main>
  );
}

function HomeView({ people, onOpenRoom, onInvite, onTheme }: { people: SocialProfile[]; onOpenRoom: () => void; onInvite: () => void; onTheme: () => void }) {
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Home · For you</p><h1 className="mt-2 text-3xl font-black">Find your room.</h1></div><button onClick={onInvite} className="rounded-full bg-white/10 p-3 text-white/70"><Share2 className="h-4 w-4" /></button></div><div className="flex gap-2 overflow-x-auto pb-1">{['Related', 'Explore', 'Event'].map((item, index) => <button key={item} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${index === 0 ? 'bg-white text-[#171326]' : 'bg-white/10 text-white/60'}`}>{item}</button>)}</div><div className="grid gap-4 md:grid-cols-3">{roomThemes.map((theme, index) => <button key={theme.name} onClick={index === 0 ? onOpenRoom : onTheme} className={`group relative min-h-48 overflow-hidden rounded-3xl bg-gradient-to-br ${theme.colors} p-5 text-left shadow-xl`}><div className="absolute -right-5 -top-5 text-8xl opacity-30 transition group-hover:scale-110">{theme.icon}</div><div className="relative flex h-full flex-col justify-end"><span className="text-3xl">{theme.icon}</span><h2 className="mt-4 text-xl font-black">{theme.name}</h2><p className="mt-1 text-xs text-white/70">{12 + index * 9} people · All on mic</p></div></button>)}</div><section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">People you may like</h2><button className="text-xs font-bold text-rose-300">See all</button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{people.slice(0, 4).map((person) => <div key={person.id} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"><div className="flex h-32 items-center justify-center bg-gradient-to-br from-violet-700 to-rose-500">{person.avatarUrl ? <img src={person.avatarUrl} alt={person.displayName} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-white/60" />}</div><div className="p-3"><p className="truncate text-sm font-bold">{person.displayName}</p><p className="mt-1 text-[10px] text-white/45">{person.city || 'Nearby'} · online</p></div></div>)}</div></section></div>;
}

function PartyView({ theme, roomName, roomId, hostMode, joinedSeats, activeGame, roomMenuOpen, onBack, onHost, onSeat, onGame, onMenu, onInvite, onGift }: { theme: typeof roomThemes[number]; roomName: string; roomId: string; hostMode: boolean; joinedSeats: number[]; activeGame: string; roomMenuOpen: boolean; onBack: () => void; onHost: () => void; onSeat: (seat: number) => void; onGame: (game: string) => void; onMenu: () => void; onInvite: () => void; onGift: (gift: Gift) => void }) {
  return <div className="space-y-4"><div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${theme.colors} p-4 shadow-2xl`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.2),transparent_35%)]" /><div className="relative flex items-center justify-between"><button onClick={onBack} className="rounded-full bg-black/20 p-2"><ChevronLeft className="h-5 w-5" /></button><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Voice room</p><h1 className="font-black">{roomName}</h1><p className="text-[10px] text-white/60">ID {roomId} · 128 online</p></div><div className="flex gap-2"><button onClick={onInvite} className="rounded-full bg-black/20 p-2"><Share2 className="h-4 w-4" /></button><button onClick={onMenu} className="rounded-full bg-black/20 p-2"><MoreHorizontal className="h-4 w-4" /></button></div></div><div className="relative mt-6 grid grid-cols-5 gap-2">{seats.map((seat) => <button key={seat} onClick={() => onSeat(seat)} className={`aspect-square rounded-2xl border text-center transition ${joinedSeats.includes(seat) ? 'border-amber-300 bg-amber-300/20 shadow-lg shadow-amber-900/20' : 'border-white/15 bg-black/15 hover:bg-white/10'}`}><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${joinedSeats.includes(seat) ? 'bg-amber-300 text-amber-950' : 'bg-white/10 text-white/45'}`}>{joinedSeats.includes(seat) ? <Mic className="h-4 w-4" /> : <span className="text-xs font-black">{seat}</span>}</div><p className="mt-1 text-[9px] font-bold text-white/55">{joinedSeats.includes(seat) ? 'On mic' : 'Join'}</p></button>)}</div><div className="relative mt-4 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3"><div><p className="text-xs font-black">{hostMode ? 'You are hosting' : 'All on Mic'}</p><p className="text-[10px] text-white/55">Tap a seat to join the conversation</p></div><button onClick={onHost} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-gray-900">{hostMode ? 'Stop host' : 'Host room'}</button></div>{roomMenuOpen && <div className="absolute right-4 top-16 z-10 w-44 rounded-2xl border border-white/10 bg-[#241d39] p-2 shadow-2xl"><button className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-xs font-bold hover:bg-white/10"><Settings className="h-4 w-4" />Room settings</button><button className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-xs font-bold hover:bg-white/10"><ShieldCheck className="h-4 w-4" />Room rules</button></div>}</div><div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-rose-300">Play center</p><h2 className="mt-1 text-xl font-black">Make the room move</h2></div><button className="rounded-full bg-white/10 p-2"><Palette className="h-4 w-4" /></button></div><div className="grid grid-cols-5 gap-2">{[['Music', Music2], ['Lucky Wheel', Trophy], ['Calculator', MoreHorizontal], ['Sounds', Zap], ['PK Battle', SwordsIcon]].map(([label, Icon]) => <button key={String(label)} className="rounded-2xl bg-white/5 p-3 text-center hover:bg-white/10"><IconRenderer icon={Icon as typeof Music2} /><span className="mt-2 block text-[10px] font-bold text-white/60">{String(label)}</span></button>)}</div><div className="mt-4 flex gap-2 overflow-x-auto">{gamesForDisplay.map((game) => <button key={game.name} onClick={() => onGame(game.name)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black ${activeGame === game.name ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/60'}`}>{game.emoji} {game.name}</button>)}</div>{activeGame && <div className="mt-3 rounded-2xl bg-rose-500/15 p-3 text-xs font-bold text-rose-100">{activeGame} is ready. Invite the room to play.</div>}</div><div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4"><p className="text-sm font-black text-amber-100">Room rules</p><p className="mt-2 text-xs leading-5 text-white/60">No abusive language · No personal attacks · Respect every voice.</p><button onClick={onInvite} className="mt-3 flex items-center gap-2 text-xs font-black text-amber-200"><Share2 className="h-3.5 w-3.5" />Share your room to others</button></div><GiftPanelMini onGift={onGift} /></div>;
}

function ChatView({ people, onGift, coins, onStore }: { people: SocialProfile[]; onGift: (gift: Gift, target: SocialProfile) => void; coins: number; onStore: () => void }) { const [selected, setSelected] = useState<SocialProfile | null>(people[0] || null); const [text, setText] = useState(''); return <div className="space-y-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Connect</p><h1 className="mt-2 text-3xl font-black">Chat & messages</h1></div><div className="grid gap-4 md:grid-cols-[.7fr_1.3fr]"><div className="space-y-2 rounded-3xl bg-white/5 p-3 ring-1 ring-white/10"><div className="grid grid-cols-2 gap-2 p-1"><button className="rounded-xl bg-white/10 py-2 text-xs font-black">Messages</button><button className="rounded-xl py-2 text-xs font-bold text-white/45">Voice Party</button></div>{people.slice(0, 6).map((person) => <button key={person.id} onClick={() => setSelected(person)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${selected?.id === person.id ? 'bg-rose-500/15' : 'hover:bg-white/5'}`}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-rose-500"><UserRound className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{person.displayName}</p><p className="text-[10px] text-white/40">Online now</p></div><MessageCircle className="h-4 w-4 text-white/30" /></button>)}</div><div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">{selected ? <><div className="flex items-center gap-3 border-b border-white/10 pb-4"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500"><UserRound className="h-5 w-5" /></div><div><p className="font-black">{selected.displayName}</p><p className="text-xs text-emerald-300">Active in voice party</p></div></div><div className="flex h-48 flex-col justify-end gap-2 py-4"><div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white/10 p-3 text-sm text-white/75">Hey! Join my voice room tonight 🎧</div>{text && <div className="max-w-[78%] self-end rounded-2xl rounded-br-sm bg-rose-500 p-3 text-sm">{text}</div>}</div><GiftPanelMini onGift={(gift) => onGift(gift, selected)} /><div className="mt-3 flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none focus:border-rose-400" /><button onClick={() => setText('')} className="rounded-xl bg-rose-500 px-4"><Send className="h-4 w-4" /></button></div><button onClick={onStore} className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-200"><Coins className="h-4 w-4" />{coins} coins · open store</button></> : <div className="flex h-full items-center justify-center text-sm text-white/45">Choose someone to chat with.</div>}</div></div></div>; }

function MineView({ profile, wallet, onRecharge, onSignOut }: { profile: SocialProfile | null; wallet: WalletState; onRecharge: () => void; onSignOut: () => void }) { return <div className="space-y-6"><div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-800 via-fuchsia-700 to-rose-500 p-6"><div className="absolute -right-8 -top-12 text-[10rem] opacity-15">👑</div><div className="relative flex items-center gap-4">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/20" /> : <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15"><UserRound className="h-9 w-9" /></div>}<div><p className="text-2xl font-black">{profile?.displayName || 'Your profile'}</p><p className="mt-1 text-xs text-white/70">Noble level 3 · VIP member</p><div className="mt-2 flex gap-2"><span className="rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-amber-950">NOBLE 3</span><span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-black">VIP</span></div></div></div></div><div className="grid grid-cols-3 gap-3">{[['Diamonds', wallet.purchasedCoins * 10, 'text-violet-300', Crown], ['Coins', wallet.coins, 'text-amber-300', Coins], ['Crowns', Math.floor(wallet.purchasedCoins / 10), 'text-yellow-300', Trophy]].map(([label, value, color, Icon]) => <div key={String(label)} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><IconRenderer icon={Icon as typeof Coins} className={String(color)} /><p className="mt-3 text-xl font-black">{String(value)}</p><p className="text-[10px] font-bold text-white/45">{String(label)}</p></div>)}</div><div className="grid gap-3 sm:grid-cols-2"><button onClick={onRecharge} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-sm font-black text-black"><Wallet className="h-5 w-5" />Wallet & recharge</button><button className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-4 text-sm font-black"><Sparkles className="h-5 w-5 text-rose-300" />My moments</button></div><div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10"><h2 className="font-black">Your benefits</h2><div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-white/55"><div><Trophy className="mx-auto mb-2 h-5 w-5 text-amber-300" />Noble rewards</div><div><MessageCircle className="mx-auto mb-2 h-5 w-5 text-rose-300" />Chat bubbles</div><div><Palette className="mx-auto mb-2 h-5 w-5 text-violet-300" />Profile frames</div></div></div><button onClick={onSignOut} className="w-full rounded-xl border border-white/10 py-3 text-sm font-bold text-white/50">Sign out</button></div>; }

function GiftPanelMini({ onGift }: { onGift: (gift: Gift) => void }) { const [open, setOpen] = useState(false); return <div className="rounded-2xl bg-amber-300/10 p-3"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-black text-amber-100"><Gift className="h-4 w-4" />Premium gifts</p><button onClick={() => setOpen((value) => !value)} className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black text-amber-950">{open ? 'Close' : 'Open panel'}</button></div>{open && <div className="mt-3 grid grid-cols-4 gap-2">{gifts.slice(0, 8).map((gift) => <button key={gift.name} onClick={() => onGift(gift)} className="rounded-xl bg-white/10 p-2 text-center hover:bg-rose-500/30"><span className="text-2xl">{gift.emoji}</span><span className="mt-1 block truncate text-[9px] font-bold">{gift.name}</span><span className="text-[9px] text-amber-200">{gift.price}</span></button>)}</div>}</div>; }
function CoinStoreModal({ open, onClose, onPurchase }: { open: boolean; onClose: () => void; onPurchase: (coins: number, price: number) => void }) { if (!open) return null; return <Modal title="Coin store" onClose={onClose}><div className="space-y-3">{[[50, 50], [100, 100], [500, 500]].map(([coins, price]) => <button key={coins} onClick={() => onPurchase(coins, price)} className="flex w-full items-center justify-between rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-left hover:bg-amber-300/20"><span className="flex items-center gap-3"><Coins className="h-6 w-6 text-amber-300" /><span><b className="block">{coins} Coins</b><small className="text-white/45">Instant local wallet credit</small></span></span><b className="text-amber-200">₹{price}</b></button>)}</div></Modal>; }
function RechargeModal({ open, onClose, onPurchase }: { open: boolean; onClose: () => void; onPurchase: () => void }) { if (!open) return null; return <Modal title="Big recharge bonus" onClose={onClose}><div className="rounded-3xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600 p-5 text-center text-black"><p className="text-xs font-black uppercase tracking-widest">Limited-time bonus</p><p className="mt-2 text-5xl font-black">00:58:53</p><p className="mt-2 text-sm font-bold">Recharge 1,000 diamonds</p><button onClick={onPurchase} className="mt-5 w-full rounded-2xl bg-black py-4 text-lg font-black text-amber-200">INR 57 · Recharge now</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-2xl bg-white/5 p-3"><Crown className="mx-auto mb-2 text-amber-300" />1 day crown</div><div className="rounded-2xl bg-white/5 p-3"><MessageCircle className="mx-auto mb-2 text-rose-300" />2 day bubbles</div><div className="rounded-2xl bg-white/5 p-3"><Palette className="mx-auto mb-2 text-violet-300" />3 day frame</div></div></Modal>; }
function InviteSheet({ open, onClose, people }: { open: boolean; onClose: () => void; people: SocialProfile[] }) { if (!open) return null; return <div className="fixed inset-0 z-[75] flex items-end bg-black/60"><motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="w-full rounded-t-[2rem] bg-[#201a31] p-6"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Invite friends</h2><button onClick={onClose} className="rounded-full bg-white/10 p-2"><X /></button></div><div className="mt-5 grid grid-cols-4 gap-3 text-center text-xs font-bold"><ShareButton label="WhatsApp" icon="🟢" /><ShareButton label="Facebook" icon="🔵" /><ShareButton label="Instagram" icon="🌈" /><ShareButton label="Moment" icon="✨" /></div><div className="mt-6 flex gap-2 border-b border-white/10 pb-3 text-xs font-black"><span className="border-b-2 border-rose-400 pb-3 text-rose-300">Recently</span><span className="text-white/45">Friends</span><span className="text-white/45">Followers</span></div><div className="mt-3 space-y-2">{people.slice(0, 4).map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><div className="h-9 w-9 rounded-full bg-rose-500" /><span className="flex-1 text-sm font-bold">{person.displayName}</span><button className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-black">Share</button></div>)}</div></div></motion.div></div>; }
function ShareButton({ label, icon }: { label: string; icon: string }) { return <button className="rounded-2xl bg-white/5 p-3 hover:bg-white/10"><span className="text-2xl">{icon}</span><span className="mt-2 block text-[10px] text-white/60">{label}</span></button>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><motion.section initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-3xl bg-[#211a32] p-6 shadow-2xl ring-1 ring-white/10"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{title}</h2><button onClick={onClose} className="rounded-full bg-white/10 p-2"><X /></button></div><div className="mt-5">{children}</div></motion.section></div>; }
function GiftOverlay({ gift, onClose }: { gift: Gift | null; onClose: () => void }) { return <AnimatePresence>{gift && <motion.div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>{Array.from({ length: 20 }).map((_, index) => <motion.span key={index} className="absolute text-3xl" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(index) * (100 + index * 13), y: Math.sin(index) * (100 + index * 11), opacity: 0, rotate: 360 }} transition={{ duration: 1.4, delay: index * .02 }}>{index % 2 ? '✨' : gift.emoji}</motion.span>)}<motion.div initial={{ scale: .1, y: 120, rotate: -18 }} animate={{ scale: [ .1, 1.3, 1 ], y: 0, rotate: [ -18, 8, 0 ] }} transition={{ type: 'spring', bounce: .45, duration: 1 }} className="text-center"><div className="text-[9rem] drop-shadow-2xl">{gift.emoji}</div><p className="text-3xl font-black">{gift.name} sent!</p><p className="mt-2 text-sm text-white/60">A premium moment just landed in the room.</p></motion.div><button onClick={onClose} className="absolute right-5 top-5 rounded-full bg-white/10 p-3"><X /></button></motion.div>}</AnimatePresence>; }
function GiftPanelMiniUnused() { return null; }
function IconRenderer({ icon: Icon, className = '' }: { icon: React.ComponentType<{ className?: string }>; className?: string }) { return <Icon className={`mx-auto h-5 w-5 ${className}`} />; }
function SwordsIcon({ className = '' }: { className?: string }) { return <Zap className={className} />; }
