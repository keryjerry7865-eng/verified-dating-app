import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Compass, MessageSquare, User, Share2, MapPin, Heart, Plus, 
  Image as ImageIcon, Send, X, Mic, Video, Settings, Camera, ThumbsUp, 
  Bell, Eye, Award, Sparkles, ChevronRight, GraduationCap, Briefcase, 
  Sliders, Wallet, CreditCard, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ShieldAlert, Phone
} from 'lucide-react';

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
type Profile = {
  name: string;
  bio: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  college: string;
  qualification: string;
  jobProfile: string;
  distancePreference: number;
  hobbies: string;
  avatar: string;
};
type Match = { name: string; avatar: string; age?: number; city?: string; state?: string; college?: string; qualification?: string; jobProfile?: string; hobbies?: string };
type Gift = { name: string; emoji: string; price: number };
type CallInvite = { userName: string; type: 'audio' | 'video' };
interface LiveStreamingRoomProps { roomType: string; onLeave: () => void; userCoins: number; setUserCoins: Setter<number>; incomeWallet: number; setIncomeWallet: Setter<number>; setIsShareOpen: (value: boolean) => void; profile: Profile; }
interface InviteBottomSheetProps { isOpen: boolean; onClose: () => void; friends: Match[]; }
const matchPool: Match[] = [
  { name: 'Kritika Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=320&q=80' },
  { name: 'Maya Singh', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=320&q=80' },
  { name: 'Aarchu Gupta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&q=80' },
];
const giftOptions: Gift[] = [{ name: 'Rose', emoji: '🌹', price: 10 }, { name: 'Crown', emoji: '👑', price: 150 }, { name: 'Car', emoji: '🚗', price: 250 }];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null); 
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{ userName: string; type: 'audio' | 'video' } | null>(null);

  // Global Ledger Wallet States
  const [userCoins, setUserCoins] = useState(3800);
  const [incomeWallet, setIncomeWallet] = useState(420);
  const [upiId, setUpiId] = useState('');
  const [vipStatus, setVipStatus] = useState<string | null>(null);
  const [whoViewedCount] = useState(38);
  const [whoLikedCount] = useState(22);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([
    "AI Guard: Secure system monitoring is actively tracking live feeds 24/7."
  ]);

  // Comprehensive User Parameters Row Configuration
  const [profile, setProfile] = useState({
    name: 'keryjerry7865',
    bio: 'Premium verified host 🌟 Noble Level 3',
    age: 24,
    gender: 'Male',
    city: 'Kolkata',
    state: 'West Bengal',
    college: 'St. Xavier\'s College',
    qualification: 'B.Tech Computer Science',
    jobProfile: 'Software UI Engineer',
    distancePreference: 25,
    hobbies: 'Music Production, Traveling',
    avatar: 'https://unsplash.com'
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [unlockedChats, setUnlockedChats] = useState<Array<{ name: string; avatar: string }>>([]);

  const friendsToShareList = [
    { id: 1, name: 'Kritika Sharma', avatar: 'https://unsplash.com' },
    { id: 2, name: 'Maya Singh', avatar: 'https://unsplash.com' },
    { id: 3, name: 'Aarchu Gupta', avatar: 'https://unsplash.com' }
  ];

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex justify-center items-center font-sans overflow-hidden selection:bg-pink-500">
      <div className="w-full max-w-md h-full bg-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20">
          {currentRoom ? (
            <LiveStreamingRoom 
              roomType={currentRoom}
              onLeave={() => setCurrentRoom(null)}
              userCoins={userCoins}
              setUserCoins={setUserCoins}
              incomeWallet={incomeWallet}
              setIncomeWallet={setIncomeWallet}
              setIsShareOpen={setIsShareOpen}
              profile={profile}
            />
          ) : (
            <>
              <header className="p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">💖</span>
                  <h1 className="text-xs font-black tracking-widest bg-gradient-to-r from-pink-500 to-fuchsia-400 bg-clip-text text-transparent uppercase">Destiny Live</h1>
                  {vipStatus && <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[7px] px-1 rounded shadow-sm">VIP</span>}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                    <span className="text-yellow-400">🪙</span>
                    <span>{userCoins}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-slate-400"><Eye size={12} /> {whoViewedCount}</div>
                  <div className="flex items-center gap-0.5 text-pink-500"><Heart size={11} fill="currentColor" /> {whoLikedCount}</div>
                </div>
              </header>

              {activeTab === 'home' && (
                <ExploreDashboard 
                  setRoom={setCurrentRoom} 
                  profile={profile} 
                  userCoins={userCoins}
                  setUserCoins={setUserCoins}
                  systemAlerts={systemAlerts}
                  setVipStatus={setVipStatus}
                />
              )}

              {activeTab === 'party' && (
                <DatingMatchCenter 
                  unlockedChats={unlockedChats}
                  setUnlockedChats={setUnlockedChats}
                  profile={profile}
                  blockedUsers={blockedUsers}
                  setBlockedUsers={setBlockedUsers}
                />
              )}

              {activeTab === 'chat' && (
                <PrivateChatPanel 
                  unlockedChats={unlockedChats}
                  userCoins={userCoins}
                  setUserCoins={setUserCoins}
                  setIncomeWallet={setIncomeWallet}
                  onStartCallInvite={(name, type) => setActiveCall({ userName: name, type })}
                  blockedUsers={blockedUsers}
                />
              )}

              {activeTab === 'mine' && (
                <ProfileSettingsManager 
                  profile={profile} 
                  setProfile={setProfile} 
                  incomeWallet={incomeWallet} 
                  setIncomeWallet={setIncomeWallet} 
                  upiId={upiId} 
                  setUpiId={setUpiId} 
                />
              )}
            </>
          )}
        </div>

        {!currentRoom && (
          <footer className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 h-16 flex justify-around items-center z-40 px-2">
            {[
              { id: 'home', label: 'Explore', icon: <Home size={18} /> },
              { id: 'party', label: 'Match Box', icon: <Compass size={18} /> },
              { id: 'chat', label: 'Messages', icon: <MessageSquare size={18} /> },
              { id: 'mine', label: 'Profile', icon: <User size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-16 h-full transition ${activeTab === tab.id ? 'text-pink-500 font-black scale-105' : 'text-slate-400 hover:text-slate-300'}`}
              >
                {tab.icon}
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            ))}
          </footer>
        )}

        <InviteBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} friends={friendsToShareList} />
        {activeCall && <VoiceVideoCallScreen call={activeCall} onClose={() => setActiveCall(null)} />}
      </div>
    </div>
  );
}

function ExploreDashboard({ setRoom, profile, userCoins, setUserCoins, systemAlerts, vipStatus, setVipStatus }: any) {
  const [moments, setMoments] = useState([
    { id: 1, author: 'Kritika Sharma', text: 'Live hosting right now! 🎙️ Join my room.', image: 'https://unsplash.com' }
  ]);
  const [postText, setPostText] = useState('');
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [aiLog, setAiLog] = useState('AI Status: Monitoring...');
  const [showCoins, setShowCoins] = useState(false);
  const [showVip, setShowVip] = useState(false);
  const [gateState, setGateState] = useState<'select' | 'load' | 'success'>('select');
  const mediaRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      setProgress(40);
      reader.onloadend = () => { setProgress(null); setLocalImage(reader.result as string); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-3 space-y-4 animate-fadeIn relative">
      <div className="bg-slate-950 border border-purple-900/40 p-2 rounded-xl flex items-center gap-2">
        <ShieldAlert size={14} className="text-purple-400 animate-pulse" />
        <span className="text-[9px] font-mono text-purple-300">{aiLog}</span>
      </div>

      {/* NO GAME SLOTS - 10+ core links grids array matrix only */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Video Live', i: '🎥', a: () => setRoom('video') },
          { l: 'Voice Room', i: '🎙️', a: () => setRoom('audio') },
          { l: 'Coin Store', i: '🪙', a: () => { setShowCoins(true); setGateState('select'); } },
          { l: 'VIP Pass', i: '👑', a: () => { setShowVip(true); setGateState('select'); } }
        ].map((item, idx) => (
          <div key={idx} onClick={item.a} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition">
            <span className="text-base">{item.i}</span>
            <span className="text-[10px] font-black text-slate-300 mt-0.5">{item.l}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Post Media Moment</p>
        <div className="flex gap-2">
          <input ref={mediaRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          <button type="button" onClick={() => mediaRef.current?.click()} className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-[10px] font-bold text-slate-300">{progress ? `Uploading ${progress}%` : 'Upload photo'}</button>
          <input value={postText} onChange={(event) => setPostText(event.target.value)} placeholder="Share a moment..." className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs outline-none" />
          <button type="button" onClick={() => { if (!postText.trim() && !localImage) return; setMoments((items) => [{ id: Date.now(), author: profile.name, text: postText || 'Uploaded a moment.', image: localImage || profile.avatar }, ...items]); setPostText(''); setLocalImage(null); }} className="rounded-xl bg-pink-600 px-3 text-xs font-black"><Plus size={14} /></button>
        </div>
        {localImage && <img src={localImage} alt="Selected moment preview" className="h-36 w-full rounded-xl object-cover" />}
      </div>
      <div className="space-y-2">{moments.map((moment) => <article key={moment.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"><div className="flex items-center gap-2 p-2.5"><div className="h-7 w-7 rounded-full bg-pink-600/40" /><span className="text-xs font-black text-pink-400">{moment.author}</span></div><img src={moment.image} alt="Shared moment" className="h-48 w-full object-cover" /><p className="p-2.5 text-xs text-slate-200">{moment.text}</p></article>)}</div>
      {showCoins && <CoinStore onClose={() => setShowCoins(false)} userCoins={userCoins} setUserCoins={setUserCoins} gateState={gateState} setGateState={setGateState} />}
      {showVip && <VipStore onClose={() => setShowVip(false)} vipStatus={vipStatus} setVipStatus={setVipStatus} gateState={gateState} setGateState={setGateState} />}
    </div>
  );
}

function CoinStore({ onClose, userCoins, setUserCoins, gateState, setGateState }: { onClose: () => void; userCoins: number; setUserCoins: Setter<number>; gateState: 'select' | 'load' | 'success'; setGateState: Setter<'select' | 'load' | 'success'> }) {
  const purchase = (amount: number) => { setGateState('load'); window.setTimeout(() => { setUserCoins((value) => value + amount); setGateState('success'); }, 500); };
  return <ModalShell title="Coin Store" onClose={onClose}><p className="text-xs text-slate-400">Balance: {userCoins} coins</p>{gateState === 'success' ? <p className="mt-4 text-sm font-black text-emerald-400">Payment successful. Coins added.</p> : <div className="mt-4 grid grid-cols-2 gap-2">{[500, 1200, 3000, 6000].map((amount) => <button type="button" key={amount} disabled={gateState === 'load'} onClick={() => purchase(amount)} className="rounded-xl bg-pink-600 p-3 text-xs font-black">{amount} coins<br /><span className="text-[10px] text-pink-100">₹{Math.ceil(amount / 10)}</span></button>)}</div>}</ModalShell>;
}

function VipStore({ onClose, vipStatus, setVipStatus, gateState, setGateState }: { onClose: () => void; vipStatus: string | null; setVipStatus: Setter<string | null>; gateState: 'select' | 'load' | 'success'; setGateState: Setter<'select' | 'load' | 'success'> }) { const activate = () => { setGateState('load'); window.setTimeout(() => { setVipStatus('VIP ACTIVE'); setGateState('success'); }, 500); }; return <ModalShell title="VIP Pass" onClose={onClose}>{gateState === 'success' || vipStatus ? <p className="text-sm font-black text-amber-300">VIP is active on your profile.</p> : <button type="button" disabled={gateState === 'load'} onClick={activate} className="mt-4 w-full rounded-xl bg-amber-400 py-3 text-xs font-black text-slate-950">Activate VIP Pass</button>}</ModalShell>; }

function DatingMatchCenter({ unlockedChats, setUnlockedChats, profile, blockedUsers, setBlockedUsers }: { unlockedChats: Array<{ name: string; avatar: string }>; setUnlockedChats: Setter<Array<{ name: string; avatar: string }>>; profile: Profile; blockedUsers: string[]; setBlockedUsers: Setter<string[]> }) { const [index, setIndex] = useState(0); const pool = matchPool.filter((item) => !blockedUsers.includes(item.name)); if (!pool.length) return <div className="p-8 text-center text-xs text-slate-400">No new profiles available.</div>; const current = pool[index % pool.length]; const like = () => { if (!unlockedChats.some((item) => item.name === current.name)) setUnlockedChats((items) => [...items, { name: current.name, avatar: current.avatar }]); setIndex((value) => value + 1); }; return <section className="space-y-3 p-3"><h2 className="text-center text-base font-black text-pink-500">Destiny Match Box</h2><article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"><img src={current.avatar} alt={current.name} className="h-56 w-full object-cover" /><div className="space-y-2 p-3"><div className="flex items-center justify-between"><h3 className="text-lg font-black">{current.name}, {current.age}</h3><span className="text-[10px] text-pink-300">📍 {current.city}</span></div><div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300"><span>🏢 {current.city}, {current.state}</span><span>🎓 {current.qualification}</span><span>🏫 {current.college}</span><span>💼 {current.jobProfile}</span></div><p className="rounded-lg bg-black/30 p-2 text-[10px] text-slate-400">Core interests: {current.hobbies}</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setIndex((value) => value + 1)} className="rounded-xl border border-slate-700 py-2 text-xs font-black">Pass</button><button type="button" onClick={like} className="rounded-xl bg-pink-600 py-2 text-xs font-black"><Heart className="mr-1 inline h-3.5 w-3.5" />Like</button></div><button type="button" onClick={() => { setBlockedUsers((items) => [...items, current.name]); setIndex((value) => value + 1); }} className="w-full text-[10px] text-red-400">Block profile</button></div></article><p className="text-[10px] text-slate-500">Your profile: {profile.name}</p></section>; }

function PrivateChatPanel({ unlockedChats, userCoins, setUserCoins, setIncomeWallet, onStartCallInvite, blockedUsers }: { unlockedChats: Array<{ name: string; avatar: string }>; userCoins: number; setUserCoins: Setter<number>; setIncomeWallet: Setter<number>; onStartCallInvite: (name: string, type: 'audio' | 'video') => void; blockedUsers: string[] }) { const chats = unlockedChats.filter((item) => !blockedUsers.includes(item.name)); const [active, setActive] = useState(chats[0] || { name: 'No match yet', avatar: '' }); const [message, setMessage] = useState(''); const sendGift = () => { if (userCoins < 10) return; setUserCoins((value) => value - 10); setIncomeWallet((value) => value + 4); }; return <section className="space-y-3 p-3"><h2 className="text-base font-black text-pink-500">Private Messages</h2><div className="grid grid-cols-[.7fr_1.3fr] gap-2"><div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950 p-2">{chats.length ? chats.map((chat) => <button type="button" key={chat.name} onClick={() => setActive(chat)} className="flex w-full items-center gap-2 rounded-xl p-2 text-left"><img src={chat.avatar} alt={chat.name} className="h-8 w-8 rounded-full object-cover" /><span className="truncate text-[10px] font-black">{chat.name}</span></button>) : <p className="p-2 text-[10px] text-slate-500">Like a profile to unlock chat.</p>}</div><div className="rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-sm font-black">{active.name}</p><div className="my-4 min-h-32 rounded-xl bg-slate-900 p-2 text-xs">{chats.length ? 'Mutual match confirmed. Say hello.' : 'Your unlocked conversations appear here.'}</div><div className="mb-2 flex gap-2"><button type="button" onClick={() => onStartCallInvite(active.name, 'audio')} disabled={!chats.length} className="flex-1 rounded-xl bg-emerald-600 p-2 text-[10px] font-black disabled:opacity-40"><Phone className="mr-1 inline h-3 w-3" />Audio call</button><button type="button" onClick={() => onStartCallInvite(active.name, 'video')} disabled={!chats.length} className="flex-1 rounded-xl bg-violet-600 p-2 text-[10px] font-black disabled:opacity-40"><Video className="mr-1 inline h-3 w-3" />Video call</button></div><form onSubmit={(event) => { event.preventDefault(); setMessage(''); }} className="flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl bg-slate-900 p-2 text-xs" /><button type="submit" onClick={sendGift} className="rounded-xl bg-pink-600 p-2"><Send size={14} /></button></form></div></div></section>; }

function ProfileSettingsManager({ profile, setProfile, incomeWallet, setIncomeWallet, upiId, setUpiId }: { profile: Profile; setProfile: Setter<Profile>; incomeWallet: number; setIncomeWallet: Setter<number>; upiId: string; setUpiId: (value: string) => void }) { const [status, setStatus] = useState(''); const withdraw = () => { if (!upiId.trim()) return setStatus('Enter a UPI ID first.'); if (!incomeWallet) return setStatus('Income wallet is empty.'); setIncomeWallet(0); setStatus('Withdrawal request submitted.'); }; return <section className="space-y-3 p-3"><div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-pink-700 to-indigo-950 p-4"><img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-full object-cover" /><div><h2 className="text-lg font-black">{profile.name}</h2><p className="text-xs text-white/70">{profile.city} · Noble Level 3</p></div></div><div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-black">Profile configuration</p><input value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="Display name" /><input value={profile.city} onChange={(event) => setProfile((value) => ({ ...value, city: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="City" /><textarea value={profile.bio} onChange={(event) => setProfile((value) => ({ ...value, bio: event.target.value }))} className="w-full rounded-xl bg-slate-900 p-2 text-xs" placeholder="Bio" /></div><div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-slate-950 p-3"><p className="text-xs font-black text-emerald-300">Income Wallet · ₹{incomeWallet}</p><div className="flex gap-2"><input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="yourname@upi" className="min-w-0 flex-1 rounded-xl bg-slate-900 p-2 text-xs" /><button type="button" onClick={withdraw} className="rounded-xl bg-emerald-600 px-3 text-[10px] font-black">Withdraw</button></div>{status && <p className="text-[10px] text-emerald-300">{status}</p>}</div></section>; }

function LiveStreamingRoom({ roomType, onLeave, userCoins, setUserCoins, incomeWallet, setIncomeWallet, setIsShareOpen, profile }: LiveStreamingRoomProps) { const [message, setMessage] = useState(''); const [messages, setMessages] = useState(['Iris joined the room.', 'Welcome to the live stream.']); const sendGift = (gift: Gift) => { if (userCoins < gift.price) return; setUserCoins((value) => value - gift.price); setIncomeWallet((value) => value + Math.round(gift.price * .35)); }; return <section className="space-y-3 p-3"><div className="relative rounded-2xl bg-gradient-to-br from-pink-700 via-purple-800 to-indigo-950 p-3"><div className="flex items-center justify-between"><button type="button" onClick={onLeave} className="rounded-xl bg-black/25 p-2"><X size={16} /></button><p className="text-xs font-black">{roomType} live room</p><button type="button" onClick={() => setIsShareOpen(true)} className="rounded-xl bg-black/25 p-2"><Share2 size={16} /></button></div><div className="flex h-36 items-center justify-center"><Mic className="h-10 w-10 text-white/60" /></div><div className="rounded-xl bg-black/30 p-2"><div className="max-h-20 space-y-1 overflow-y-auto">{messages.slice(-5).map((item, index) => <p key={`${item}-${index}`} className="text-xs">{item}</p>)}</div><form onSubmit={(event) => { event.preventDefault(); if (message.trim()) setMessages((items) => [...items, `${profile.name}: ${message.trim()}`]); setMessage(''); }} className="mt-2 flex gap-1"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Say something..." className="min-w-0 flex-1 rounded-lg bg-black/25 p-2 text-xs" /><button type="submit" className="rounded-lg bg-pink-600 p-2"><Send size={13} /></button></form></div></div><div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2 text-center"><p className="col-span-3 text-xs font-black">Send a gift · Host wallet ₹{incomeWallet}</p>{giftOptions.map((gift) => <button type="button" key={gift.name} onClick={() => sendGift(gift)} className="rounded-xl bg-slate-900 p-2"><span className="text-xl">{gift.emoji}</span><span className="block text-[10px]">{gift.price} coins</span></button>)}</div><div className="grid grid-cols-5 gap-1">{Array.from({ length: 20 }, (_, index) => <button type="button" key={index} className="rounded-lg border border-slate-800 bg-slate-950 p-1 text-[9px] text-slate-400"><Mic className="mx-auto h-3 w-3" />{index + 1}</button>)}</div></section>; }

function VoiceVideoCallScreen({ call, onClose }: { call: { userName: string; type: 'audio' | 'video' }; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"><section className="w-full max-w-sm rounded-2xl bg-slate-900 p-5 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-600">{call.type === 'video' ? <Video /> : <Phone />}</div><h2 className="mt-4 text-lg font-black">{call.userName} is calling</h2><p className="text-xs text-slate-400">Incoming {call.type} call</p><button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-emerald-600 py-2 text-xs font-black">Accept call</button><button type="button" onClick={onClose} className="mt-2 w-full rounded-xl bg-red-600 py-2 text-xs font-black">Decline</button></section></div>; }

function InviteBottomSheet({ isOpen, onClose, friends }: InviteBottomSheetProps) { if (!isOpen) return null; return <div className="fixed inset-0 z-50 flex items-end bg-black/70"><section className="w-full rounded-t-2xl bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="font-black">Invite friends</h2><button type="button" onClick={onClose}><X size={18} /></button></div><div className="mt-4 space-y-2">{friends.map((friend) => <button type="button" key={friend.name} onClick={onClose} className="flex w-full items-center gap-2 rounded-xl bg-slate-950 p-2 text-left"><img src={friend.avatar} alt={friend.name} className="h-8 w-8 rounded-full object-cover" /><span className="flex-1 text-xs font-black">{friend.name}</span><Share2 size={14} /></button>)}</div></section></div>; }

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><section className="w-full max-w-sm rounded-2xl bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="font-black">{title}</h2><button type="button" onClick={onClose}><X size={18} /></button></div>{children}</section></div>; }