import { useRef, useState } from 'react';
import { Compass, DollarSign, Gift, Home as HomeIcon, MessageSquare, Mic, Plus, Send, Share2, User, X } from 'lucide-react';

type TabId = 'home' | 'party' | 'chat' | 'mine';
type Profile = { name: string; age: number; location: string; bio: string; img: string };
type StateSetter<T> = (value: T | ((current: T) => T)) => void;

export interface SocialDashboardProps {
  initialCoins?: number;
  initialIncomeWallet?: number;
}

interface LivePartyRoomProps {
  userCoins: number;
  setUserCoins: StateSetter<number>;
  incomeWallet: number;
  setIncomeWallet: StateSetter<number>;
  setInRoom: (value: boolean) => void;
  setIsShareOpen: (value: boolean) => void;
}
interface DatingMatchEngineProps { unlockedChats: string[]; setUnlockedChats: StateSetter<string[]>; }
interface ChatInboxManagerProps { unlockedChats: string[]; }
interface ProfileDashboardProps {
  hostDiamonds: number;
  incomeWallet: number;
  setIncomeWallet: StateSetter<number>;
  upiId: string;
  setUpiId: (value: string) => void;
  profileName: string;
  setProfileName: (value: string) => void;
  profileBio: string;
  setProfileBio: (value: string) => void;
  profileLocation: string;
  setProfileLocation: (value: string) => void;
  profileHobby: string;
  setProfileHobby: (value: string) => void;
  profileAvatar: string;
  setProfileAvatar: (value: string) => void;
}
interface InviteBottomSheetProps { isOpen: boolean; onClose: () => void; }

const profiles: Profile[] = [
  { name: 'Kritika Sharma', age: 24, location: 'Kolkata, 3.2 km', bio: 'Love music and late-night voice chatting.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80' },
  { name: 'Aarchu Gupta', age: 22, location: 'Delhi, 12 km', bio: 'Looking for genuine connections.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&q=80' },
  { name: 'Maya Singh', age: 26, location: 'Mumbai, 5 km', bio: 'Good energy and honest conversations.', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=640&q=80' },
];
const giftOptions = [{ name: 'Rose', emoji: '🌹', price: 10 }, { name: 'Crown', emoji: '👑', price: 150 }, { name: 'Car', emoji: '🚗', price: 250 }];

export default function App({ initialCoins = 3850, initialIncomeWallet = 359 }: SocialDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [inRoom, setInRoom] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [userCoins, setUserCoins] = useState(initialCoins);
  const [hostDiamonds] = useState(40000);
  const [incomeWallet, setIncomeWallet] = useState(initialIncomeWallet);
  const [upiId, setUpiId] = useState('');
  const [profileName, setProfileName] = useState('keryjerry7865');
  const [profileBio, setProfileBio] = useState('Noble level 3 - verified host');
  const [profileLocation, setProfileLocation] = useState('Kolkata, WB');
  const [profileHobby, setProfileHobby] = useState('Music Jamming');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [unlockedChats, setUnlockedChats] = useState<string[]>([]);

  const renderActiveView = () => {
    if (inRoom) return <LivePartyRoom userCoins={userCoins} setUserCoins={setUserCoins} incomeWallet={incomeWallet} setIncomeWallet={setIncomeWallet} setInRoom={setInRoom} setIsShareOpen={setIsShareOpen} />;
    switch (activeTab) {
      case 'home': return <ExploreDashboard setInRoom={setInRoom} profileAvatar={profileAvatar} />;
      case 'party': return <DatingMatchEngine unlockedChats={unlockedChats} setUnlockedChats={setUnlockedChats} />;
      case 'chat': return <ChatInboxManager unlockedChats={unlockedChats} />;
      case 'mine': return <ProfileDashboard hostDiamonds={hostDiamonds} incomeWallet={incomeWallet} setIncomeWallet={setIncomeWallet} upiId={upiId} setUpiId={setUpiId} profileName={profileName} setProfileName={setProfileName} profileBio={profileBio} setProfileBio={setProfileBio} profileLocation={profileLocation} setProfileLocation={setProfileLocation} profileHobby={profileHobby} setProfileHobby={setProfileHobby} profileAvatar={profileAvatar} setProfileAvatar={setProfileAvatar} />;
      default: return <ExploreDashboard setInRoom={setInRoom} profileAvatar={profileAvatar} />;
    }
  };

  return <div className="flex min-h-screen w-full justify-center bg-slate-950 font-sans text-white"><div className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-slate-900 shadow-2xl"><main className="flex-1 overflow-y-auto pb-20">{renderActiveView()}</main>{!inRoom && <footer className="absolute bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800/80 bg-slate-900/95 px-2 backdrop-blur-md">{([{ id: 'home' as const, label: 'Home', icon: <HomeIcon size={18} /> }, { id: 'party' as const, label: 'Match', icon: <Compass size={18} /> }, { id: 'chat' as const, label: 'Chat', icon: <MessageSquare size={18} /> }, { id: 'mine' as const, label: 'Mine', icon: <User size={18} /> }]).map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-full w-16 flex-col items-center justify-center ${activeTab === tab.id ? 'scale-105 font-black text-pink-500' : 'text-slate-400'}`}>{tab.icon}<span className="mt-0.5 text-[10px]">{tab.label}</span></button>)}</footer>}<InviteBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} /></div></div>;
}

function ExploreDashboard({ setInRoom, profileAvatar }: { setInRoom: (value: boolean) => void; profileAvatar: string }) {
  const [text, setText] = useState('');
  const [moments, setMoments] = useState([{ id: 1, user: 'Priya__X', text: 'Beautiful vibes tonight!', likes: 24, img: '' }]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const post = (event: React.FormEvent) => { event.preventDefault(); if (!text.trim()) return; setMoments((current) => [{ id: Date.now(), user: 'You', text: text.trim(), likes: 0, img: profileAvatar }, ...current]); setText(''); };
  return <section className="space-y-4 p-3"><div className="relative flex h-28 flex-col justify-between overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900 to-indigo-950 p-3 shadow-xl"><div><h2 className="text-sm font-black text-pink-400">Magic Virgo Premium</h2><p className="mt-0.5 text-[10px] text-slate-300">Enter active audio rooms to sync matches.</p></div><button type="button" onClick={() => setInRoom(true)} className="w-max rounded-full bg-pink-600 px-4 py-1.5 text-[10px] font-black">Go live stream</button></div><div><p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Entertainment matrix</p><div className="grid grid-cols-4 gap-1.5">{['🎲 Ludo', '🎥 Video', '🎯 Carrom', '🤝 Friends', '📦 Lucky Box', '🛡️ Family', '🏆 Ranking', '🔥 Squad'].map((item) => <button type="button" key={item} onClick={() => setInRoom(true)} className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-[10px] font-bold text-slate-300">{item}</button>)}</div></div><div className="flex gap-3 overflow-x-auto">{profiles.map((person) => <button type="button" key={person.name} onClick={() => setInRoom(true)} className="flex shrink-0 flex-col items-center gap-1"><img src={person.img} alt={person.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-500/40" /><span className="text-[9px] text-slate-400">{person.name.split(' ')[0]}</span></button>)}</div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Share your moment</p><form onSubmit={post} className="flex gap-2"><input ref={fileInputRef} type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="What is on your mind?" className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs outline-none" /><button type="submit" className="rounded-xl bg-pink-600 px-3"><Plus size={14} /></button></form>{moments.map((item) => <article key={item.id} className="rounded-xl border border-slate-800/60 bg-slate-900 p-2.5"><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-pink-600/40" /><span className="text-[11px] font-black text-pink-400">{item.user}</span></div><p className="mt-2 text-xs">{item.text}</p><div className="mt-2 flex h-36 items-center justify-center rounded-lg bg-gradient-to-br from-pink-900/50 to-indigo-900/50 text-4xl">✨</div><p className="mt-1 text-[10px] text-slate-500">{item.likes} likes</p></article>)}</div></section>;
}

function DatingMatchEngine({ unlockedChats, setUnlockedChats }: DatingMatchEngineProps) { const [index, setIndex] = useState(0); const current = profiles[index % profiles.length]; const unlock = () => { if (!unlockedChats.includes(current.name)) setUnlockedChats((items) => [...items, current.name]); }; return <section className="space-y-4 p-3"><div className="text-center"><h2 className="text-base font-black text-pink-500">Dating Match Engine</h2><p className="text-[10px] text-slate-500">Mutual likes unlock the conversation.</p></div><article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"><img src={current.img} alt={current.name} className="h-80 w-full object-cover" /><div className="p-3"><h3 className="text-xl font-black">{current.name}, {current.age}</h3><p className="text-xs text-pink-300">{current.location}</p><p className="mt-2 text-xs text-slate-300">{current.bio}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => setIndex((value) => value + 1)} className="flex-1 rounded-xl border border-slate-700 py-2 text-xs font-black">Pass</button><button type="button" onClick={unlock} className="flex-1 rounded-xl bg-pink-600 py-2 text-xs font-black">Mutual like</button></div></div></article></section>; }

function ChatInboxManager({ unlockedChats }: ChatInboxManagerProps) { const [selected, setSelected] = useState(profiles[0]); const [message, setMessage] = useState(''); const isUnlocked = unlockedChats.includes(selected.name); return <section className="space-y-4 p-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-pink-400">Matches</p><h2 className="mt-1 text-2xl font-black">Chat inbox</h2></div><div className="grid grid-cols-[.7fr_1.3fr] gap-2"><div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950 p-2">{profiles.map((person) => <button type="button" key={person.name} onClick={() => setSelected(person)} className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-slate-800"><img src={person.img} alt={person.name} className="h-8 w-8 rounded-full object-cover" /><span className="truncate text-[10px] font-black">{person.name}</span></button>)}</div><div className="rounded-2xl border border-slate-800 bg-slate-950 p-3"><div className="flex items-center gap-2 border-b border-slate-800 pb-3"><img src={selected.img} alt={selected.name} className="h-10 w-10 rounded-full object-cover" /><div><p className="text-sm font-black">{selected.name}</p><p className="text-[10px] text-emerald-400">{isUnlocked ? 'Matched' : 'Like to unlock'}</p></div></div><div className="flex min-h-56 flex-col justify-end gap-2 py-3"><p className="max-w-[85%] rounded-xl bg-slate-800 p-2 text-xs">{isUnlocked ? 'Hey, welcome to the room.' : 'Mutual like required to chat.'}</p></div><form onSubmit={(event) => { event.preventDefault(); setMessage(''); }} className="flex gap-2"><input disabled={!isUnlocked} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs outline-none disabled:opacity-50" /><button disabled={!isUnlocked} type="submit" className="rounded-xl bg-pink-600 p-2 disabled:opacity-50"><Send size={14} /></button></form></div></div></section>; }

function ProfileDashboard({ hostDiamonds, incomeWallet, setIncomeWallet, upiId, setUpiId, profileName, setProfileName, profileBio, setProfileBio, profileLocation, setProfileLocation, profileHobby, setProfileHobby, profileAvatar, setProfileAvatar }: ProfileDashboardProps) { const [status, setStatus] = useState(''); const withdraw = () => { if (!upiId.trim()) return setStatus('Enter a UPI ID first.'); if (incomeWallet <= 0) return setStatus('Your income wallet is empty.'); setIncomeWallet(0); setStatus(`Withdrawal requested for ${upiId.trim()}.`); }; return <section className="space-y-4 p-3"><div className="rounded-2xl bg-gradient-to-br from-pink-700 to-indigo-950 p-4"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/15">{profileAvatar ? <img src={profileAvatar} alt={profileName} className="h-full w-full object-cover" /> : <User size={28} />}</div><div><h2 className="text-xl font-black">{profileName}</h2><p className="text-xs text-white/70">{profileLocation} · {profileHobby}</p></div></div></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-950 p-3"><Gift className="h-4 w-4 text-pink-400" /><p className="mt-2 text-xl font-black">{hostDiamonds}</p><p className="text-[10px] text-slate-500">Host diamonds</p></div><div className="rounded-xl bg-slate-950 p-3"><DollarSign className="h-4 w-4 text-emerald-400" /><p className="mt-2 text-xl font-black">₹{incomeWallet}</p><p className="text-[10px] text-slate-500">Income wallet</p></div></div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-black">Profile configuration</p><input value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Display name" className="w-full rounded-xl bg-slate-900 p-2 text-xs" /><input value={profileLocation} onChange={(event) => setProfileLocation(event.target.value)} placeholder="Location" className="w-full rounded-xl bg-slate-900 p-2 text-xs" /><input value={profileHobby} onChange={(event) => setProfileHobby(event.target.value)} placeholder="Hobby" className="w-full rounded-xl bg-slate-900 p-2 text-xs" /><textarea value={profileBio} onChange={(event) => setProfileBio(event.target.value)} placeholder="Bio" className="w-full rounded-xl bg-slate-900 p-2 text-xs" /><input value={profileAvatar} onChange={(event) => setProfileAvatar(event.target.value)} placeholder="Avatar URL" className="w-full rounded-xl bg-slate-900 p-2 text-xs" /></div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-black">Withdraw via UPI</p><div className="flex gap-2"><input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="yourname@upi" className="min-w-0 flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs" /><button type="button" onClick={withdraw} className="rounded-xl bg-emerald-600 px-3 text-xs font-black">Withdraw</button></div>{status && <p className="text-[10px] text-emerald-300">{status}</p>}</div></section>; }

function LivePartyRoom({ userCoins, setUserCoins, incomeWallet, setIncomeWallet, setInRoom, setIsShareOpen }: LivePartyRoomProps) { const [message, setMessage] = useState(''); const [messages, setMessages] = useState(['Iris joined the room.', 'Wanna jump into the voice party?']); const sendMessage = (event: React.FormEvent) => { event.preventDefault(); if (!message.trim()) return; setMessages((items) => [...items, message.trim()]); setMessage(''); }; const sendGift = (price: number) => { if (userCoins < price) return; setUserCoins((value) => value - price); setIncomeWallet((value) => value + Math.round(price * 0.35)); }; return <section className="space-y-3 p-3"><div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-pink-700 via-purple-800 to-indigo-950 p-3"><div className="flex items-center justify-between"><button type="button" onClick={() => setInRoom(false)} className="rounded-xl bg-black/25 p-2"><X size={16} /></button><p className="text-xs font-black">Midnight Voice Lounge</p><button type="button" onClick={() => setIsShareOpen(true)} className="rounded-xl bg-black/25 p-2"><Share2 size={16} /></button></div><div className="flex h-full items-center justify-center"><Mic className="h-10 w-10 text-white/60" /></div><div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/30 p-2 backdrop-blur-sm"><div className="max-h-20 space-y-1 overflow-y-auto">{messages.slice(-4).map((item, index) => <p key={`${item}-${index}`} className="text-xs text-white/85">{item}</p>)}</div><form onSubmit={sendMessage} className="mt-2 flex gap-1"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Say something..." className="min-w-0 flex-1 rounded-lg bg-black/25 px-2 py-1.5 text-xs outline-none" /><button type="submit" className="rounded-lg bg-pink-600 p-1.5"><Send size={13} /></button></form></div></div><div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 text-center"><p className="col-span-3 text-xs font-black">Send a gift · Host wallet ₹{incomeWallet}</p>{giftOptions.map((gift) => <button type="button" key={gift.name} onClick={() => sendGift(gift.price)} className="rounded-xl bg-slate-900 p-2"><span className="text-2xl">{gift.emoji}</span><span className="block text-[10px] font-black">{gift.price} coins</span></button>)}</div></section>; }

function InviteBottomSheet({ isOpen, onClose }: InviteBottomSheetProps) { if (!isOpen) return null; return <div className="fixed inset-0 z-50 flex items-end bg-black/70"><section className="w-full rounded-t-2xl bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="font-black">Invite friends</h2><button type="button" onClick={onClose}><X size={18} /></button></div><div className="mt-4 grid grid-cols-3 gap-2"><button type="button" className="rounded-xl bg-emerald-600 p-2 text-xs font-black">WhatsApp</button><button type="button" className="rounded-xl bg-blue-600 p-2 text-xs font-black">Facebook</button><button type="button" className="rounded-xl bg-pink-600 p-2 text-xs font-black">Moment</button></div></section></div>; }
