import { useRef, useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { Compass, DollarSign, Eye, Gift, Heart, Home, MessageSquare, Mic, Plus, Send, Share2, User, X } from 'lucide-react';

type ViewId = 'home' | 'party' | 'chat' | 'mine';
type Setter<T> = Dispatch<SetStateAction<T>>;
type Profile = {
  name: string;
  age: number;
  city: string;
  bio: string;
  avatar: string;
};
type Match = { name: string; avatar: string };

interface ExploreDashboardProps {
  setRoom: (room: string | null) => void;
  profile: Profile;
  userCoins: number;
  setUserCoins: Setter<number>;
  systemAlerts: string[];
  setSystemAlerts: Setter<string[]>;
  vipStatus: string | null;
  setVipStatus: Setter<string | null>;
}
interface DatingMatchEngineProps {
  unlockedChats: Match[];
  setUnlockedChats: Setter<Match[]>;
  blockedUsers: string[];
  setBlockedUsers: Setter<string[]>;
}
interface ChatInboxManagerProps {
  unlockedChats: Match[];
  userCoins: number;
  setUserCoins: Setter<number>;
  setIncomeWallet: Setter<number>;
  blockedUsers: string[];
}
interface ProfileDashboardProps {
  profile: Profile;
  setProfile: Setter<Profile>;
  hostDiamonds: number;
  incomeWallet: number;
  setIncomeWallet: Setter<number>;
  upiId: string;
  setUpiId: (value: string) => void;
}
interface LivePartyRoomProps {
  roomType: string;
  onLeave: () => void;
  userCoins: number;
  setUserCoins: Setter<number>;
  incomeWallet: number;
  setIncomeWallet: Setter<number>;
  setIsShareOpen: (value: boolean) => void;
  profile: Profile;
}
interface InviteBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Match[];
}

const initialProfile: Profile = {
  name: 'keryjerry7865',
  age: 24,
  city: 'Kolkata, West Bengal',
  bio: 'Premium verified host. Noble Level 3.',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80',
};
const matchPool: Match[] = [
  { name: 'Kritika Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&q=80' },
  { name: 'Maya Singh', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=320&q=80' },
  { name: 'Aarchu Gupta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&q=80' },
];
const giftOptions = [{ name: 'Rose', emoji: '🌹', price: 10 }, { name: 'Crown', emoji: '👑', price: 150 }, { name: 'Car', emoji: '🚗', price: 250 }];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>('home');
  const [activeStreaming, setActiveStreaming] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userCoins, setUserCoins] = useState(3800);
  const [incomeWallet, setIncomeWallet] = useState(420);
  const [upiId, setUpiId] = useState('');
  const [vipStatus, setVipStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [systemAlerts, setSystemAlerts] = useState(['AI Guard: Secure system monitoring is active.']);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [unlockedChats, setUnlockedChats] = useState<Match[]>([]);

  const renderView = () => {
    if (activeStreaming) return <LivePartyRoom roomType={activeStreaming} onLeave={() => setActiveStreaming(null)} userCoins={userCoins} setUserCoins={setUserCoins} incomeWallet={incomeWallet} setIncomeWallet={setIncomeWallet} setIsShareOpen={setIsShareOpen} profile={profile} />;
    switch (currentView) {
      case 'home': return <ExploreDashboard setRoom={setActiveStreaming} profile={profile} userCoins={userCoins} setUserCoins={setUserCoins} systemAlerts={systemAlerts} setSystemAlerts={setSystemAlerts} vipStatus={vipStatus} setVipStatus={setVipStatus} />;
      case 'party': return <DatingMatchEngine unlockedChats={unlockedChats} setUnlockedChats={setUnlockedChats} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} />;
      case 'chat': return <ChatInboxManager unlockedChats={unlockedChats} userCoins={userCoins} setUserCoins={setUserCoins} setIncomeWallet={setIncomeWallet} blockedUsers={blockedUsers} />;
      case 'mine': return <ProfileDashboard profile={profile} setProfile={setProfile} hostDiamonds={40000} incomeWallet={incomeWallet} setIncomeWallet={setIncomeWallet} upiId={upiId} setUpiId={setUpiId} />;
      default: return <ExploreDashboard setRoom={setActiveStreaming} profile={profile} userCoins={userCoins} setUserCoins={setUserCoins} systemAlerts={systemAlerts} setSystemAlerts={setSystemAlerts} vipStatus={vipStatus} setVipStatus={setVipStatus} />;
    }
  };

  return <div className="flex min-h-screen w-full justify-center bg-slate-950 font-sans text-white"><div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-slate-900 shadow-2xl"><main className="flex-1 overflow-y-auto pb-20">{renderView()}</main>{!activeStreaming && <footer className="absolute bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800/80 bg-slate-900/95 px-2 backdrop-blur-md">{([{ id: 'home' as const, label: 'Explore', icon: <Home size={18} /> }, { id: 'party' as const, label: 'Match Box', icon: <Compass size={18} /> }, { id: 'chat' as const, label: 'Messages', icon: <MessageSquare size={18} /> }, { id: 'mine' as const, label: 'Profile', icon: <User size={18} /> }]).map((tab) => <button type="button" key={tab.id} onClick={() => setCurrentView(tab.id)} className={`flex h-full w-16 flex-col items-center justify-center ${currentView === tab.id ? 'scale-105 font-black text-pink-500' : 'text-slate-400'}`}>{tab.icon}<span className="mt-0.5 text-[10px]">{tab.label}</span></button>)}</footer>}<InviteBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} friends={matchPool} /></div></div>;
}

function ExploreDashboard({ setRoom, profile, userCoins, setUserCoins, systemAlerts, setSystemAlerts, vipStatus, setVipStatus }: ExploreDashboardProps) {
  const [moments, setMoments] = useState([{ id: 1, author: 'Kritika Sharma', text: 'Live hosting right now. Join my micro seat arena.', image: matchPool[0].avatar }]);
  const [postText, setPostText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postMoment = (event: FormEvent) => { event.preventDefault(); if (!postText.trim()) return; setMoments((items) => [{ id: Date.now(), author: profile.name, text: postText.trim(), image: profile.avatar }, ...items]); setSystemAlerts((items) => [...items, 'Moment posted successfully.']); setPostText(''); };
  return <section className="space-y-4 p-3"><header className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900 to-indigo-950 p-3 shadow-xl"><div className="flex items-center justify-between"><div><h1 className="text-sm font-black text-pink-400">Magic Virgo Premium</h1><p className="mt-1 text-[10px] text-slate-300">Live rooms, matches, and shared moments.</p></div><span className="text-xs text-yellow-300">🪙 {userCoins}</span></div><button type="button" onClick={() => setRoom('voice')} className="mt-4 rounded-full bg-pink-600 px-4 py-1.5 text-[10px] font-black">Go live stream</button></header><div><p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Entertainment matrix</p><div className="grid grid-cols-4 gap-1.5">{['🎲 Ludo', '🎥 Video', '🎯 Carrom', '🤝 Friends', '📦 Lucky Box', '🛡️ Family', '🏆 Ranking', '🔥 Squad'].map((item) => <button type="button" key={item} onClick={() => setRoom('voice')} className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-[10px] font-bold text-slate-300">{item}</button>)}</div></div><div className="flex gap-3 overflow-x-auto">{matchPool.map((match) => <button type="button" key={match.name} onClick={() => setRoom('voice')} className="flex shrink-0 flex-col items-center gap-1"><img src={match.avatar} alt={match.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-500/40" /><span className="text-[9px] text-slate-400">{match.name.split(' ')[0]}</span></button>)}</div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main moments feed</p>{vipStatus && <span className="text-[9px] text-yellow-300">{vipStatus}</span>}</div><form onSubmit={postMoment} className="flex gap-2"><input ref={fileInputRef} value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Share a moment..." className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs outline-none" /><button type="submit" className="rounded-xl bg-pink-600 px-3"><Plus size={14} /></button></form>{moments.map((moment) => <article key={moment.id} className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900"><div className="flex items-center gap-2 p-2.5"><img src={moment.image} alt={moment.author} className="h-7 w-7 rounded-full object-cover" /><span className="text-[11px] font-black text-pink-400">{moment.author}</span></div><img src={moment.image} alt="Shared moment" className="h-48 w-full object-cover" /><p className="p-2.5 text-xs text-slate-200">{moment.text}</p></article>)}</div></section>;
}

function DatingMatchEngine({ unlockedChats, setUnlockedChats, blockedUsers, setBlockedUsers }: DatingMatchEngineProps) { const [index, setIndex] = useState(0); const available = matchPool.filter((match) => !blockedUsers.includes(match.name)); if (!available.length) return <div className="p-8 text-center text-xs text-slate-400">No new profiles available.</div>; const current = available[index % available.length]; const like = () => { if (!unlockedChats.some((match) => match.name === current.name)) setUnlockedChats((items) => [...items, current]); setIndex((value) => value + 1); }; return <section className="space-y-4 p-3"><div className="text-center"><h2 className="text-base font-black text-pink-500">Mutual Like Dating Match Engine</h2><p className="text-[10px] text-slate-500">Match profiles to unlock private chat.</p></div><article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"><img src={current.avatar} alt={current.name} className="h-80 w-full object-cover" /><div className="p-3"><h3 className="text-xl font-black">{current.name}</h3><p className="text-xs text-pink-300">Kolkata · 4.2 km away</p><p className="mt-2 text-xs text-slate-300">Verified profile ready for an honest conversation.</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setIndex((value) => value + 1)} className="flex-1 rounded-xl border border-slate-700 py-2 text-xs font-black">Pass</button><button type="button" onClick={like} className="flex-1 rounded-xl bg-pink-600 py-2 text-xs font-black"><Heart className="mr-1 inline h-3.5 w-3.5" />Like</button></div><button type="button" onClick={() => { setBlockedUsers((items) => [...items, current.name]); setIndex((value) => value + 1); }} className="mt-3 w-full text-[10px] text-red-400">Block profile</button></div></article></section>; }

function ChatInboxManager({ unlockedChats, blockedUsers }: ChatInboxManagerProps) { const activeMatches = unlockedChats.filter((match) => !blockedUsers.includes(match.name)); const [selected, setSelected] = useState<Match>(activeMatches[0] || matchPool[0]); const [message, setMessage] = useState(''); return <section className="space-y-4 p-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-pink-400">Messages</p><h2 className="mt-1 text-2xl font-black">Chat inbox</h2></div><div className="grid grid-cols-[.7fr_1.3fr] gap-2"><div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950 p-2">{(activeMatches.length ? activeMatches : matchPool).map((match) => <button type="button" key={match.name} onClick={() => setSelected(match)} className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-slate-800"><img src={match.avatar} alt={match.name} className="h-8 w-8 rounded-full object-cover" /><span className="truncate text-[10px] font-black">{match.name}</span></button>)}</div><div className="rounded-2xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center gap-2 border-b border-slate-800 pb-3"><img src={selected.avatar} alt={selected.name} className="h-10 w-10 rounded-full object-cover" /><div><p className="text-sm font-black">{selected.name}</p><p className="text-[10px] text-emerald-400">{activeMatches.some((match) => match.name === selected.name) ? 'Mutual match' : 'Like to unlock'}</p></div></div><div className="flex min-h-56 flex-col justify-end gap-2 py-3"><p className="rounded-xl bg-slate-800 p-2 text-xs">{activeMatches.some((match) => match.name === selected.name) ? 'Hey, welcome to the private chat.' : 'Mutual like required to chat.'}</p></div><form onSubmit={(event) => { event.preventDefault(); setMessage(''); }} className="flex gap-2"><input disabled={!activeMatches.some((match) => match.name === selected.name)} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs outline-none disabled:opacity-50" /><button type="submit" className="rounded-xl bg-pink-600 p-2"><Send size={14} /></button></form></div></div></section>; }

function ProfileDashboard({ profile, setProfile, hostDiamonds, incomeWallet, setIncomeWallet, upiId, setUpiId }: ProfileDashboardProps) { const [status, setStatus] = useState(''); const withdraw = () => { if (!upiId.trim()) return setStatus('Enter a UPI ID first.'); if (incomeWallet <= 0) return setStatus('Income wallet is empty.'); setIncomeWallet(0); setStatus(`Withdrawal requested for ${upiId}.`); }; return <section className="space-y-4 p-3"><div className="rounded-2xl bg-gradient-to-br from-pink-700 to-indigo-950 p-4"><div className="flex items-center gap-3"><img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-full object-cover" /><div><h2 className="text-xl font-black">{profile.name}</h2><p className="text-xs text-white/70">{profile.city} · Noble Level 3</p></div></div></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-950 p-3"><Gift className="h-4 w-4 text-pink-400" /><p className="mt-2 text-xl font-black">{hostDiamonds}</p><p className="text-[10px] text-slate-500">Host diamonds</p></div><div className="rounded-xl bg-slate-950 p-3"><DollarSign className="h-4 w-4 text-emerald-400" /><p className="mt-2 text-xl font-black">₹{incomeWallet}</p><p className="text-[10px] text-slate-500">Income wallet</p></div></div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-black">Profile configuration</p><input value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="Display name" /><input value={profile.city} onChange={(event) => setProfile((value) => ({ ...value, city: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="City" /><textarea value={profile.bio} onChange={(event) => setProfile((value) => ({ ...value, bio: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="Bio" /></div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-black">Withdraw via UPI</p><div className="flex gap-2"><input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="yourname@upi" className="min-w-0 flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs" /><button type="button" onClick={withdraw} className="rounded-xl bg-emerald-600 px-3 text-xs font-black">Withdraw</button></div>{status && <p className="text-[10px] text-emerald-300">{status}</p>}</div></section>; }

function LivePartyRoom({ roomType, onLeave, userCoins, setUserCoins, incomeWallet, setIncomeWallet, setIsShareOpen }: LivePartyRoomProps) { const [message, setMessage] = useState(''); const [messages, setMessages] = useState(['Iris joined the room.', 'Wanna jump into the voice party?']); const sendMessage = (event: FormEvent) => { event.preventDefault(); if (!message.trim()) return; setMessages((items) => [...items, message.trim()]); setMessage(''); }; const sendGift = (price: number) => { if (userCoins < price) return; setUserCoins((value) => value - price); setIncomeWallet((value) => value + Math.round(price * 0.35)); }; return <section className="space-y-3 p-3"><div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-pink-700 via-purple-800 to-indigo-950 p-3"><div className="flex items-center justify-between"><button type="button" onClick={onLeave} className="rounded-xl bg-black/25 p-2"><X size={16} /></button><p className="text-xs font-black">{roomType} live room</p><button type="button" onClick={() => setIsShareOpen(true)} className="rounded-xl bg-black/25 p-2"><Share2 size={16} /></button></div><div className="flex h-full items-center justify-center"><Mic className="h-10 w-10 text-white/60" /></div><div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/30 p-2 backdrop-blur-sm"><div className="max-h-20 space-y-1 overflow-y-auto">{messages.slice(-4).map((item, index) => <p key={`${item}-${index}`} className="text-xs text-white/85">{item}</p>)}</div><form onSubmit={sendMessage} className="mt-2 flex gap-1"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Say something..." className="min-w-0 flex-1 rounded-lg bg-black/25 px-2 py-1.5 text-xs outline-none" /><button type="submit" className="rounded-lg bg-pink-600 p-1.5"><Send size={13} /></button></form></div></div><div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 text-center"><p className="col-span-3 text-xs font-black">Send a gift · Host wallet ₹{incomeWallet}</p>{giftOptions.map((gift) => <button type="button" key={gift.name} onClick={() => sendGift(gift.price)} className="rounded-xl bg-slate-900 p-2"><span className="text-2xl">{gift.emoji}</span><span className="block text-[10px] font-black">{gift.price} coins</span></button>)}</div></section>; }

function InviteBottomSheet({ isOpen, onClose, friends }: InviteBottomSheetProps) { if (!isOpen) return null; return <div className="fixed inset-0 z-50 flex items-end bg-black/70"><section className="w-full rounded-t-2xl bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="font-black">Invite friends</h2><button type="button" onClick={onClose}><X size={18} /></button></div><div className="mt-4 space-y-2">{friends.map((friend) => <button type="button" key={friend.name} onClick={onClose} className="flex w-full items-center gap-2 rounded-xl bg-slate-950 p-2 text-left"><img src={friend.avatar} alt={friend.name} className="h-8 w-8 rounded-full object-cover" /><span className="flex-1 text-xs font-black">{friend.name}</span><Share2 size={14} /></button>)}</div></section></div>; }
+
*** End Patch