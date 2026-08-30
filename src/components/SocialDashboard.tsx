import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Camera, ChevronLeft, Coins, Crown, Gift, Heart, Home, LogOut, MessageCircle, Mic, MicOff, Music2, Pause, Play, Plus, Radio, Search, Send, Share2, Square, UserRound, Users, Volume2, Wallet, X, Youtube } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { normalizeProfile, readLocalProfile, type LocalProfile } from '../lib/profileFallback';
import { readWallet, writeWallet, type GiftRecord, type WalletState } from '../lib/wallet';
import LivePartyRoom from './LivePartyRoom';

type SocialDashboardProps = { session: Session; onSignOut: () => void };
type SocialProfile = LocalProfile & { displayName: string; likes: number; views: number };
type Tab = 'home' | 'party' | 'room' | 'chat' | 'mine';
type RoomMode = 'live' | 'voice' | 'video';
type Gift = { name: string; emoji: string; price: number };
type ChatMessage = { id: string; senderId: string; senderName: string; body: string; createdAt: string };

const seats = Array.from({ length: 10 }, (_, index) => index + 1);
const gifts: Gift[] = [
  { name: 'Rose', emoji: '🌹', price: 10 },
  { name: 'Crown', emoji: '👑', price: 150 },
  { name: 'Bike', emoji: '🏍️', price: 100 },
  { name: 'Car', emoji: '🚗', price: 250 },
];
const roomThemes = [
  'from-rose-600 via-fuchsia-700 to-violet-900',
  'from-cyan-700 via-blue-900 to-indigo-950',
  'from-orange-500 via-rose-700 to-purple-950',
];
const swipeKey = (userId: string) => `lovematch-swipes:${userId}`;
const metricKey = (userId: string, profileId: string) => `lovematch-metrics:${userId}:${profileId}`;

const getName = (profile: LocalProfile | null, session: Session) => profile?.id === session.user.id
  ? session.user.user_metadata?.name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Member'
  : `Member ${profile?.id.slice(0, 5) || 'guest'}`;

export default function SocialDashboard({ session, onSignOut }: SocialDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [roomMode, setRoomMode] = useState<RoomMode>('voice');
  const [viewerCount, setViewerCount] = useState(1247);
  const [pendingRoomMode, setPendingRoomMode] = useState<RoomMode | null>(null);
  const [roomTheme, setRoomTheme] = useState(0);
  const [roomName, setRoomName] = useState('Midnight Voice Lounge');
  const [roomId] = useState('LM-2486');
  const [people, setPeople] = useState<SocialProfile[]>([]);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [wallet, setWallet] = useState<WalletState>(() => readWallet(session.user.id));
  const [alerts, setAlerts] = useState<string[]>([]);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [giftTarget, setGiftTarget] = useState<SocialProfile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roomChat, setRoomChat] = useState<ChatMessage[]>([]);
  const [roomMessage, setRoomMessage] = useState('');
  const [joinedSeats, setJoinedSeats] = useState<number[]>([1]);
  const [micLevels, setMicLevels] = useState<number[]>(Array(10).fill(0));
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [youtubeSearchLoading, setYoutubeSearchLoading] = useState(false);
  const [youtubeSearchMessage, setYoutubeSearchMessage] = useState('');
  const [audioVolume, setAudioVolume] = useState(0.7);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const addAlert = (message: string) => {
    setAlerts((current) => [...current, message]);
    window.setTimeout(() => setAlerts((current) => current.filter((item) => item !== message)), 4500);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setViewerCount((current) => Math.max(1, current + Math.floor(Math.random() * 17) - 8));
    }, 3500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => writeWallet(session.user.id, wallet), [session.user.id, wallet]);

  useEffect(() => {
    if (activeTab === 'party') setActiveTab('room');
  }, [activeTab]);

  useEffect(() => {
    const loadPeople = async () => {
      const local = readLocalProfile(session.user.id);
      try {
        const { data: current } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        const normalized = normalizeProfile(session.user.id, current as Record<string, unknown> | null) || local;
        if (normalized) setProfile({ ...normalized, displayName: getName(normalized, session), likes: 0, views: 0 });
        const { data: rows } = await supabase.from('profiles').select('*').neq('id', session.user.id).limit(12);
        setPeople((rows || []).map((row) => normalizeProfile(String(row.id), row as Record<string, unknown>)).filter((item): item is LocalProfile => Boolean(item)).map((item) => {
          const metrics = readMetrics(session.user.id, item.id);
          return { ...item, displayName: getName(item, session), likes: metrics.likes, views: metrics.views };
        }));
      } catch {
        if (local) setProfile({ ...local, displayName: getName(local, session), likes: 0, views: 0 });
      }
    };
    void loadPeople();
  }, [session.user.id, session]);

  useEffect(() => {
    const channel = supabase.channel(`room-events:${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `liked_id=eq.${session.user.id}` }, () => addAlert('New like received'))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () => addAlert('New match received'))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [session.user.id]);

  useEffect(() => () => stopMedia(), []);

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setCameraStream(null);
    setMicLevels(Array(10).fill(0));
  };

  const startMedia = async (mode: RoomMode) => {
    setRoomMode(mode);
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Camera and microphone access is not supported in this browser.');
      return;
    }
    try {
      stopMedia();
      const stream = await navigator.mediaDevices.getUserMedia({ video: mode !== 'voice', audio: true });
      streamRef.current = stream;
      setCameraStream(stream);
      if (videoRef.current && mode !== 'voice') videoRef.current.srcObject = stream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) connectMicMeter(stream);
    } catch (error) {
      setMediaError(error instanceof Error ? `Media permission failed: ${error.message}` : 'Media permission failed.');
    }
  };

  const requestRoomMode = (mode: RoomMode) => {
    setPendingRoomMode(mode);
  };

  const confirmRoomStart = () => {
    if (!pendingRoomMode) return;
    setPendingRoomMode(null);
    setViewerCount((current) => current + 1);
    void startMedia(pendingRoomMode);
  };

  const connectMicMeter = (stream: MediaStream) => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;
    analyserRef.current = analyser;
    const values = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(values);
      const level = Math.min(100, Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) / 2.55));
      setMicLevels(joinedSeats.map((seat) => seat === 1 ? level : Math.max(3, Math.round(level * (0.35 + seat / 20)))));
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  useEffect(() => {
    if (videoRef.current && cameraStream && roomMode !== 'voice') videoRef.current.srcObject = cameraStream;
  }, [cameraStream, roomMode]);

  const sendRoomMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const body = roomMessage.trim();
    if (!body) return;
    setRoomChat((current) => [...current, { id: crypto.randomUUID(), senderId: session.user.id, senderName: profile?.displayName || 'You', body, createdAt: new Date().toISOString() }]);
    setRoomMessage('');
  };

  const sendGift = (gift: Gift, target: SocialProfile | null = giftTarget) => {
    if (wallet.coins < gift.price) {
      setRechargeOpen(true);
      addAlert(`You need ${gift.price - wallet.coins} more coins.`);
      return;
    }
    const record: GiftRecord = { id: crypto.randomUUID(), gift: gift.name, emoji: gift.emoji, coins: gift.price, recipientId: target?.id || roomId, createdAt: new Date().toISOString() };
    setWallet((current) => ({ ...current, coins: current.coins - gift.price, receivedGifts: [...current.receivedGifts, record] }));
    setActiveGift(gift);
    addAlert(`${gift.name} sent${target ? ` to ${target.displayName}` : ''}.`);
  };

  const buyRecharge = () => {
    setWallet((current) => ({ ...current, coins: current.coins + 1000, purchasedCoins: current.purchasedCoins + 1000 }));
    setRechargeOpen(false);
    addAlert('1,000 diamonds added to your local wallet.');
  };

  const selectProfile = (person: SocialProfile) => {
    const next = { ...person, views: person.views + 1 };
    setSelectedProfile(next);
    writeMetrics(session.user.id, person.id, { views: next.views, likes: person.likes });
    setPeople((current) => current.map((item) => item.id === person.id ? next : item));
  };

  const swipe = async (person: SocialProfile, direction: 'left' | 'right') => {
    const saved = readSwipes(session.user.id);
    saved[person.id] = direction;
    writeSwipes(session.user.id, saved);
    if (direction === 'right') {
      const { data: reciprocal } = await supabase.from('likes').select('id').eq('liker_id', person.id).eq('liked_id', session.user.id).maybeSingle();
      try { await supabase.from('likes').insert({ liker_id: session.user.id, liked_id: person.id, is_mutual: Boolean(reciprocal) }); } catch { /* local swipe state remains authoritative for the UI */ }
      if (reciprocal) addAlert(`It’s a match with ${person.displayName}!`);
    }
    setPeople((current) => current.filter((item) => item.id !== person.id));
  };

  const handleAudioFile = (file: File | undefined) => {
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const nextUrl = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(nextUrl);
    setAudioPlaying(false);
  };

  const toggleAudio = async () => {
    if (!audioRef.current || !audioUrl) return;
    if (audioPlaying) { audioRef.current.pause(); setAudioPlaying(false); } else { await audioRef.current.play(); setAudioPlaying(true); }
  };

  const parseYoutubeId = (value: string) => {
    try {
      const url = new URL(value);
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
      if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') || url.pathname.split('/').pop() || '';
    } catch { return ''; }
    return '';
  };

  const resolveYoutubeQuery = async () => {
    const query = youtubeUrl.trim();
    if (!query) return;

    const directId = parseYoutubeId(query);
    if (directId) {
      setYoutubeVideoId(directId);
      setYoutubeSearchMessage('');
      return;
    }

    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      setYoutubeSearchMessage('Add VITE_YOUTUBE_API_KEY to search by title, or paste a YouTube URL.');
      return;
    }

    setYoutubeSearchLoading(true);
    setYoutubeSearchMessage('Searching YouTube...');
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`);
      if (!response.ok) throw new Error('YouTube search is unavailable right now.');
      const data = await response.json() as { items?: Array<{ id?: { videoId?: string } }> };
      const videoId = data.items?.[0]?.id?.videoId;
      if (!videoId) throw new Error('No YouTube video matched that search.');
      setYoutubeVideoId(videoId);
      setYoutubeSearchMessage('Playing the top YouTube result.');
    } catch (error) {
      setYoutubeSearchMessage(error instanceof Error ? error.message : 'Unable to search YouTube.');
    } finally {
      setYoutubeSearchLoading(false);
    }
  };

  const tabs = useMemo(() => [{ id: 'home' as const, label: 'Home', icon: Home }, { id: 'party' as const, label: 'Party', icon: Radio }, { id: 'chat' as const, label: 'Chat', icon: MessageCircle }, { id: 'mine' as const, label: 'Mine', icon: UserRound }], []);
  const currentCard = people[0];

  if (activeTab === 'room') {
    return (
      <main className="min-h-screen bg-[#110d1d] p-4 text-white">
        <LivePartyRoom
          roomName={roomName}
          roomId={roomId}
          theme={roomThemes[roomTheme]}
          mode={roomMode}
          viewerCount={viewerCount}
          stream={cameraStream}
          videoRef={videoRef}
          mediaError={mediaError}
          seats={seats}
          levels={micLevels}
          messages={roomChat.map((message) => ({ id: message.id, sender: message.senderName, body: message.body }))}
          message={roomMessage}
          onMessageChange={setRoomMessage}
          onSendMessage={sendRoomMessage}
          onModeRequest={(mode) => void startMedia(mode)}
          onSeat={(seat) => setJoinedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat])}
          onTheme={() => setRoomTheme((roomTheme + 1) % roomThemes.length)}
          onInvite={() => setInviteOpen(true)}
          onGift={(gift) => sendGift(gift)}
        />
        <GiftOverlay gift={activeGift} onClose={() => setActiveGift(null)} />
        <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} people={people} />
        {pendingRoomMode && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4"><div className="w-full max-w-md rounded-3xl bg-[#241b36] p-6 shadow-2xl ring-1 ring-red-300/30"><h2 className="text-xl font-black text-red-200">Before you start</h2><p className="mt-4 text-sm leading-6 text-white/75">WARNING: Pornography, nudity, violence, or adult content is strictly prohibited. Violations will lead to an immediate ban and permanent account suspension.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => setPendingRoomMode(null)} className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-bold text-white/70">Cancel</button><button type="button" onClick={confirmRoomStart} className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-black text-white">I Agree & Start</button></div></div></div>}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#110d1d] pb-24 text-white">
      <AnimatePresence>{alerts.map((alert, index) => <motion.div key={`${alert}-${index}`} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80 }} className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-md rounded-2xl border border-white/10 bg-[#241c35]/95 px-4 py-3 text-sm font-bold shadow-2xl"><Bell className="mr-2 inline h-4 w-4 text-amber-300" />{alert}</motion.div>)}</AnimatePresence>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#171125]/90 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-violet-600"><Heart className="h-5 w-5 fill-white" /></div><span className="font-black">LoveMatch</span></div><div className="flex items-center gap-2 text-xs font-black"><span className="rounded-full bg-violet-500/20 px-3 py-1.5 text-violet-200">💎 {wallet.coins}</span><span className="rounded-full bg-amber-400/20 px-3 py-1.5 text-amber-200">👑 {Math.floor(wallet.purchasedCoins / 10)}</span><button onClick={() => setRechargeOpen(true)} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-black">Recharge</button>{profile?.avatarUrl ? <button onClick={() => profile && selectProfile(profile)}><img src={profile.avatarUrl} alt={profile.displayName} className="h-9 w-9 rounded-full object-cover ring-2 ring-rose-300" /></button> : <UserRound className="h-7 w-7 text-white/50" />}</div></div></header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === 'home' && <HomeView people={people} onRoom={() => { setActiveTab('party'); requestRoomMode('voice'); }} onProfile={selectProfile} onInvite={() => setInviteOpen(true)} />}
        {activeTab === 'party' && <PartyView roomName={roomName} setRoomName={setRoomName} roomId={roomId} theme={roomThemes[roomTheme]} roomMode={roomMode} viewerCount={viewerCount} cameraStream={cameraStream} videoRef={videoRef} mediaError={mediaError} joinedSeats={joinedSeats} micLevels={micLevels} onMode={requestRoomMode} onSeat={(seat) => setJoinedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat])} onTheme={() => setRoomTheme((roomTheme + 1) % roomThemes.length)} onInvite={() => setInviteOpen(true)} roomChat={roomChat} roomMessage={roomMessage} setRoomMessage={setRoomMessage} onSendMessage={sendRoomMessage} audioFile={audioFile} audioUrl={audioUrl} audioPlaying={audioPlaying} audioRef={audioRef} audioVolume={audioVolume} onVolume={setAudioVolume} onFile={handleAudioFile} onToggleAudio={() => void toggleAudio()} youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl} youtubeVideoId={youtubeVideoId} onResolveYoutube={resolveYoutubeQuery} youtubeSearchLoading={youtubeSearchLoading} youtubeSearchMessage={youtubeSearchMessage} onGift={(gift) => sendGift(gift)} onOpenProfile={(person) => { setGiftTarget(person); selectProfile(person); }} />}
        {activeTab === 'chat' && <ChatView people={people} onProfile={selectProfile} onGift={(gift, target) => sendGift(gift, target)} onRoom={() => { setActiveTab('party'); requestRoomMode('voice'); }} coins={wallet.coins} />}
        {activeTab === 'mine' && <MineView profile={profile} wallet={wallet} onRecharge={() => setRechargeOpen(true)} onProfile={() => profile && selectProfile(profile)} onSignOut={onSignOut} />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#171326]/95 px-3 py-2 backdrop-blur-xl"><div className="mx-auto grid max-w-lg grid-cols-4 gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold ${activeTab === id ? 'bg-rose-500/15 text-rose-300' : 'text-white/45'}`}><Icon className="h-5 w-5" />{label}</button>)}</div></nav>
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} onPurchase={buyRecharge} />
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} people={people} />
      <GiftOverlay gift={activeGift} onClose={() => setActiveGift(null)} />
      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} onGift={(gift) => selectedProfile && sendGift(gift, selectedProfile)} onChat={() => { setSelectedProfile(null); setActiveTab('chat'); }} />
      {pendingRoomMode && <WarningModal mode={pendingRoomMode} onCancel={() => setPendingRoomMode(null)} onConfirm={confirmRoomStart} />}
    </main>
  );
}

function HomeView({ people, onRoom, onProfile, onInvite }: { people: SocialProfile[]; onRoom: () => void; onProfile: (person: SocialProfile) => void; onInvite: () => void }) { return <section className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Home · Related</p><h1 className="mt-2 text-3xl font-black">Find your room.</h1><p className="mt-2 text-sm text-white/50">Voice, video, and real-time connection.</p></div><button onClick={onInvite} className="rounded-full bg-white/10 p-3"><Share2 className="h-4 w-4" /></button></div><div className="flex gap-2"><button className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#171326]">Related</button><button onClick={onRoom} className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/60">Explore rooms</button><button className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/60">Event</button></div><button onClick={onRoom} className="w-full rounded-3xl bg-gradient-to-br from-rose-600 via-fuchsia-700 to-indigo-950 p-6 text-left shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-white/60">Live now</p><h2 className="mt-2 text-2xl font-black">Midnight Voice Lounge</h2><p className="mt-2 text-sm text-white/70">Join the conversation · 128 listeners</p></div><div className="rounded-2xl bg-white/15 p-4"><Radio className="h-8 w-8" /></div></div></button><section><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">People nearby</h2><span className="text-xs text-white/40">Tap a profile</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{people.slice(0, 8).map((person) => <button key={person.id} onClick={() => onProfile(person)} className="overflow-hidden rounded-2xl bg-white/5 text-left ring-1 ring-white/10"><div className="flex h-32 items-center justify-center bg-gradient-to-br from-violet-700 to-rose-500">{person.avatarUrl ? <img src={person.avatarUrl} alt={person.displayName} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-white/50" />}</div><div className="p-3"><p className="truncate text-sm font-bold">{person.displayName}</p><p className="mt-1 text-[10px] text-white/45">{person.views} views · {person.likes} likes</p></div></button>)}</div></section></section>; }

function PartyView(props: { roomName: string; setRoomName: (value: string) => void; roomId: string; theme: string; roomMode: RoomMode; cameraStream: MediaStream | null; videoRef: React.RefObject<HTMLVideoElement>; mediaError: string; joinedSeats: number[]; micLevels: number[]; onMode: (mode: RoomMode) => void; onSeat: (seat: number) => void; onTheme: () => void; onInvite: () => void; roomChat: ChatMessage[]; roomMessage: string; setRoomMessage: (value: string) => void; onSendMessage: (event: React.FormEvent) => void; audioFile: File | null; audioUrl: string; audioPlaying: boolean; audioRef: React.RefObject<HTMLAudioElement>; audioVolume: number; onVolume: (value: number) => void; onFile: (file: File | undefined) => void; onToggleAudio: () => void; youtubeUrl: string; setYoutubeUrl: (value: string) => void; youtubeVideoId: string; onResolveYoutube: () => void; youtubeSearchLoading: boolean; youtubeSearchMessage: string; onGift: (gift: Gift) => void; onOpenProfile: (person: SocialProfile) => void }) { const modeButtons: [RoomMode, string][] = [['voice', 'Voice Party'], ['video', 'Video Party'], ['live', 'Live Stream']]; return <section className="space-y-4"><div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${props.theme} p-4 shadow-2xl`}><div className="flex items-center justify-between"><button className="rounded-full bg-black/20 p-2"><ChevronLeft className="h-5 w-5" /></button><div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-white/60">{props.roomMode} room</p><h1 className="font-black">{props.roomName}</h1><p className="text-[10px] text-white/60">ID {props.roomId} · 128 online</p></div><div className="flex gap-2"><button onClick={props.onInvite} className="rounded-full bg-black/20 p-2"><Share2 className="h-4 w-4" /></button><button onClick={props.onTheme} className="rounded-full bg-black/20 p-2"><Crown className="h-4 w-4" /></button></div></div><div className="mt-4 flex gap-2 overflow-x-auto"><input value={props.roomName} onChange={(event) => props.setRoomName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none" />{modeButtons.map(([mode, label]) => <button key={mode} onClick={() => props.onMode(mode)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-black ${props.roomMode === mode ? 'bg-white text-gray-900' : 'bg-black/20 text-white/70'}`}>{label}</button>)}</div><div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black/30">{props.youtubeVideoId ? <iframe title="YouTube room video" className="h-full w-full" src={`https://www.youtube.com/embed/${props.youtubeVideoId}?autoplay=1&enablejsapi=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : props.roomMode !== 'voice' && props.cameraStream ? <video ref={props.videoRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-white/45"><Mic className="h-10 w-10" /><span className="text-xs">Voice room · microphone active</span></div>}</div>{props.youtubeVideoId && <div className="mt-2 flex justify-end"><a href={`https://www.youtube.com/watch?v=${props.youtubeVideoId}`} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-3 py-2 text-xs font-black text-gray-900">Open in YouTube</a></div>}{props.mediaError && <p className="mt-2 text-xs text-amber-200">{props.mediaError}</p>}<div className="mt-4 grid grid-cols-5 gap-2">{seats.map((seat) => <button key={seat} onClick={() => props.onSeat(seat)} className={`rounded-xl border p-2 ${props.joinedSeats.includes(seat) ? 'border-amber-300 bg-amber-300/20' : 'border-white/10 bg-black/15'}`}><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10">{props.joinedSeats.includes(seat) ? <Mic className="h-4 w-4 text-amber-200" /> : <span className="text-xs text-white/50">{seat}</span>}</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${props.micLevels[seat - 1] || 0}%` }} /></div></button>)}</div></div><MediaHub {...props} /><div className="grid gap-4 lg:grid-cols-2"><RoomChat messages={props.roomChat} message={props.roomMessage} setMessage={props.setRoomMessage} onSend={props.onSendMessage} /><GiftPanel gifts={gifts} onGift={props.onGift} onOpenProfile={props.onOpenProfile} /></div></section>; }

function MediaHub(props: any) { return <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-rose-300">Room music</p><h2 className="mt-1 font-black">Local audio player</h2></div><Music2 className="text-rose-300" /></div><input type="file" accept="audio/mpeg,audio/mp3,audio/*" onChange={(event) => props.onFile(event.target.files?.[0])} className="mt-4 block w-full text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />{props.audioUrl && <><audio ref={props.audioRef} src={props.audioUrl} loop onEnded={() => undefined} /><div className="mt-3 flex items-center gap-3"><button onClick={props.onToggleAudio} className="rounded-full bg-rose-500 p-3">{props.audioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><span className="min-w-0 flex-1 truncate text-xs font-bold">{props.audioFile?.name}</span><Volume2 className="h-4 w-4 text-white/50" /><input type="range" min="0" max="1" step=".05" value={props.audioVolume} onChange={(event) => { props.onVolume(Number(event.target.value)); if (props.audioRef.current) props.audioRef.current.volume = Number(event.target.value); }} className="w-20 accent-rose-500" /></div></>}</div><div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-red-300">Video party</p><h2 className="mt-1 font-black">YouTube search</h2></div><Youtube className="text-red-400" /></div><div className="mt-4 flex gap-2"><input value={props.youtubeUrl} onChange={(event) => props.setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void props.onResolveYoutube(); }} placeholder="Search songs or paste a YouTube URL" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs outline-none" /><button onClick={() => void props.onResolveYoutube()} disabled={props.youtubeSearchLoading} className="flex items-center gap-1 rounded-xl bg-red-500 px-3 text-xs font-black"><Search className="h-3.5 w-3.5" />{props.youtubeSearchLoading ? '...' : 'Search'}</button></div>{props.youtubeSearchMessage && <p className="mt-2 text-[11px] text-white/55">{props.youtubeSearchMessage}</p>}</div></section>; }

function RoomChat({ messages, message, setMessage, onSend }: { messages: ChatMessage[]; message: string; setMessage: (value: string) => void; onSend: (event: React.FormEvent) => void }) { return <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between"><h2 className="font-black">Room chat</h2><MessageCircle className="h-4 w-4 text-rose-300" /></div><div className="mt-3 h-40 space-y-2 overflow-y-auto rounded-2xl bg-black/15 p-3">{messages.length ? messages.map((item) => <p key={item.id} className="text-xs"><strong className="text-rose-300">{item.senderName}: </strong><span className="text-white/75">{item.body}</span></p>) : <p className="text-xs text-white/40">Be the first to say hello.</p>}</div><form onSubmit={onSend} className="mt-3 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs outline-none" /><button className="rounded-xl bg-rose-500 px-3"><Send className="h-4 w-4" /></button></form></div>; }

function GiftPanel({ gifts: options, onGift, onOpenProfile }: { gifts: Gift[]; onGift: (gift: Gift) => void; onOpenProfile: (person: SocialProfile) => void }) { return <div className="rounded-3xl bg-amber-300/10 p-4 ring-1 ring-amber-200/10"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Gift className="h-4 w-4 text-amber-300" />Animated gifts</h2><span className="text-xs text-amber-200">Car · Crown · Bike · Rose</span></div><div className="mt-4 grid grid-cols-4 gap-2">{options.map((gift) => <button key={gift.name} onClick={() => onGift(gift)} className="rounded-2xl bg-white/10 p-3 text-center transition hover:-translate-y-1 hover:bg-rose-500/20"><div className="text-3xl">{gift.emoji}</div><p className="mt-1 text-[10px] font-black">{gift.name}</p><p className="text-[10px] text-amber-200">{gift.price} 💎</p></button>)}</div><button onClick={() => onOpenProfile({ id: 'room-host', age: null, gender: '', city: 'Live room', bio: '', interests: [], avatarUrl: '', latitude: null, longitude: null, matchDistance: 25, displayName: 'Room host', likes: 18, views: 247 })} className="mt-3 text-xs font-bold text-amber-200">Open room host profile</button></div>; }

function ChatView({ people, onProfile, onGift, onRoom, coins }: { people: SocialProfile[]; onProfile: (person: SocialProfile) => void; onGift: (gift: Gift, target: SocialProfile) => void; onRoom: () => void; coins: number }) { const [selected, setSelected] = useState<SocialProfile | null>(people[0] || null); const [text, setText] = useState(''); return <section className="space-y-5"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Connect</p><h1 className="mt-2 text-3xl font-black">Chat & voice party</h1></div><button onClick={onRoom} className="flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black"><Radio className="h-4 w-4" />Voice Party</button></div><div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]"><div className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10">{people.slice(0, 8).map((person) => <button key={person.id} onClick={() => setSelected(person)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/10"><button onClick={(event) => { event.stopPropagation(); onProfile(person); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-rose-500"><UserRound className="h-4 w-4" /></button><span className="flex-1 truncate text-sm font-bold">{person.displayName}</span><MessageCircle className="h-4 w-4 text-white/30" /></button>)}</div><div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">{selected ? <><button onClick={() => onProfile(selected)} className="flex items-center gap-3 text-left"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500"><UserRound /></div><span><strong className="block">{selected.displayName}</strong><small className="text-emerald-300">Active now</small></span></button><div className="flex h-40 flex-col justify-end gap-2 py-4"><p className="max-w-[80%] rounded-2xl bg-white/10 p-3 text-sm">Want to join the voice party?</p>{text && <p className="max-w-[80%] self-end rounded-2xl bg-rose-500 p-3 text-sm">{text}</p>}</div><GiftPanel gifts={gifts} onGift={(gift) => onGift(gift, selected)} onOpenProfile={onProfile} /><div className="mt-3 flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none" /><button onClick={() => setText('')} className="rounded-xl bg-rose-500 px-4"><Send className="h-4 w-4" /></button></div><p className="mt-3 text-xs text-amber-200">💎 {coins} coins available for gifts</p></> : <p className="text-sm text-white/50">Choose someone to chat with.</p>}</div></div></section>; }

function MineView({ profile, wallet, onRecharge, onProfile, onSignOut }: { profile: SocialProfile | null; wallet: WalletState; onRecharge: () => void; onProfile: () => void; onSignOut: () => void }) { return <section className="space-y-5"><button onClick={onProfile} className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-violet-800 via-fuchsia-700 to-rose-600 p-6 text-left"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white/15">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}</div><div><h1 className="text-2xl font-black">{profile?.displayName || 'Your profile'}</h1><p className="mt-1 text-xs text-white/70">Noble level 3 · VIP profile</p><span className="mt-2 inline-block rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-amber-950">NOBLE 3</span></div></button><div className="grid grid-cols-3 gap-3">{[['Diamonds', wallet.purchasedCoins * 10, Crown], ['Coins', wallet.coins, Coins], ['Gifts received', wallet.receivedGifts.length, Gift]].map(([label, value, Icon]) => <div key={String(label)} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><IconRenderer icon={Icon as typeof Coins} /><p className="mt-3 text-xl font-black">{String(value)}</p><p className="text-[10px] font-bold text-white/45">{String(label)}</p></div>)}</div><button onClick={onRecharge} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 font-black text-black"><Wallet className="h-5 w-5" />Big recharge bonus</button><div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10"><h2 className="font-black">User Moments</h2><div className="mt-4 flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-white/40">Your moments will appear here.</div></div><button onClick={onSignOut} className="w-full rounded-xl border border-white/10 py-3 text-sm font-bold text-white/50">Sign out</button></section>; }

function RechargeModal({ open, onClose, onPurchase }: { open: boolean; onClose: () => void; onPurchase: () => void }) { if (!open) return null; return <Modal title="Big recharge bonus" onClose={onClose}><div className="rounded-3xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-600 p-5 text-center text-black"><p className="text-xs font-black uppercase tracking-widest">Limited-time offer</p><p className="mt-2 text-5xl font-black">00:58:53</p><p className="mt-2 text-sm font-bold">1,000 diamonds + bonus items</p><button onClick={onPurchase} className="mt-5 w-full rounded-2xl bg-black py-4 text-lg font-black text-amber-200">INR 57 · Recharge now</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/60"><div className="rounded-2xl bg-white/5 p-3">👑<br />1 day crown</div><div className="rounded-2xl bg-white/5 p-3">💬<br />2 day bubbles</div><div className="rounded-2xl bg-white/5 p-3">🖼️<br />3 day frame</div></div></Modal>; }

function InviteSheet({ open, onClose, people }: { open: boolean; onClose: () => void; people: SocialProfile[] }) { if (!open) return null; return <div className="fixed inset-0 z-[70] flex items-end bg-black/60"><motion.section initial={{ y: '100%' }} animate={{ y: 0 }} className="w-full rounded-t-[2rem] bg-[#211a32] p-6"><div className="mx-auto max-w-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Invite friends</h2><button onClick={onClose}><X /></button></div><div className="mt-5 grid grid-cols-4 gap-3 text-center text-xs font-bold"><span>🟢<br />WhatsApp</span><span>🔵<br />Facebook</span><span>🌈<br />Instagram</span><span>✨<br />Moment</span></div><div className="mt-6 space-y-2">{people.slice(0, 4).map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><span className="flex-1 text-sm font-bold">{person.displayName}</span><button className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-black">Share</button></div>)}</div></div></motion.section></div>; }

function ProfileModal({ profile, onClose, onGift, onChat }: { profile: SocialProfile | null; onClose: () => void; onGift: (gift: Gift) => void; onChat: () => void }) { if (!profile) return null; return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" onClick={onClose}><motion.section initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-[#241b36] p-5 shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-rose-500">{profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" /> : <UserRound />}</div><div><h2 className="text-xl font-black">{profile.displayName}</h2><p className="text-xs text-white/50">{profile.city || 'In the room'}</p></div></div><button onClick={onClose}><X /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/5 p-3"><p className="text-xl font-black">{profile.views}</p><p className="text-xs text-white/45">Views</p></div><div className="rounded-2xl bg-white/5 p-3"><p className="text-xl font-black">{profile.likes}</p><p className="text-xs text-white/45">Likes</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={onChat} className="rounded-xl bg-white/10 py-3 text-xs font-black"><MessageCircle className="mx-auto mb-1 h-4 w-4" />Chat</button><button onClick={() => onGift(gifts[0])} className="rounded-xl bg-rose-500 py-3 text-xs font-black"><Gift className="mx-auto mb-1 h-4 w-4" />Send Gift</button></div></motion.section></div>; }

function GiftOverlay({ gift, onClose }: { gift: Gift | null; onClose: () => void }) { return <AnimatePresence>{gift && <motion.div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>{Array.from({ length: 18 }).map((_, index) => <motion.span key={index} className="absolute text-3xl" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(index) * (110 + index * 12), y: Math.sin(index) * (100 + index * 11), opacity: 0, rotate: 360 }} transition={{ duration: 1.5, delay: index * .02 }}>{index % 2 ? '✨' : gift.emoji}</motion.span>)}<motion.div initial={{ scale: .1, y: 120, rotate: -15 }} animate={{ scale: [.1, 1.3, 1], y: 0, rotate: [-15, 8, 0] }} transition={{ type: 'spring', bounce: .45, duration: 1 }} className="text-center"><div className="text-[9rem] drop-shadow-2xl">{gift.emoji}</div><p className="text-3xl font-black">{gift.name} sent!</p><p className="mt-2 text-sm text-white/60">A live gift just landed in the room.</p></motion.div><button className="absolute right-5 top-5 rounded-full bg-white/10 p-3"><X /></button></motion.div>}</AnimatePresence>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><motion.section initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-3xl bg-[#211a32] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{title}</h2><button onClick={onClose}><X /></button></div><div className="mt-5">{children}</div></motion.section></div>; }
function IconRenderer({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) { return <Icon className="h-5 w-5 text-amber-300" />; }
function readSwipes(userId: string): Record<string, 'left' | 'right'> { try { return JSON.parse(localStorage.getItem(swipeKey(userId)) || '{}'); } catch { return {}; } }
function writeSwipes(userId: string, swipes: Record<string, 'left' | 'right'>) { localStorage.setItem(swipeKey(userId), JSON.stringify(swipes)); }
function readMetrics(userId: string, profileId: string) { try { return JSON.parse(localStorage.getItem(metricKey(userId, profileId)) || '{"views":0,"likes":0}') as { views: number; likes: number }; } catch { return { views: 0, likes: 0 }; } }
function writeMetrics(userId: string, profileId: string, metrics: { views: number; likes: number }) { localStorage.setItem(metricKey(userId, profileId), JSON.stringify(metrics)); }
