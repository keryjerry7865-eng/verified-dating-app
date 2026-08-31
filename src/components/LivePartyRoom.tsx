import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Gift, Mic, Radio, Search, Send, Share2, X, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

type Mode = 'voice' | 'video' | 'live';
type Gift = { name: string; emoji: string; price: number };
type Message = { id: string; sender: string; body: string };

export interface LivePartyRoomProps {
  roomName: string;
  roomId: string;
  theme: string;
  mode: Mode;
  viewerCount: number;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  mediaError: string;
  seats: number[];
  levels: number[];
  messages: Message[];
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (event: React.FormEvent) => void;
  onModeRequest: (mode: Mode) => void;
  onBack: () => void;
  onSeat: (seat: number) => void;
  onTheme: () => void;
  onInvite: () => void;
  onGift: (gift: Gift) => void;
  youtubeQuery: string;
  youtubeVideoId: string;
  onYoutubeQueryChange: (value: string) => void;
  onResolveYoutube: () => void;
  youtubeSearchLoading: boolean;
  youtubeSearchMessage: string;
};

const gifts: Gift[] = [
  { name: 'Rose', emoji: '🌹', price: 10 },
  { name: 'Crown', emoji: '👑', price: 150 },
  { name: 'Bike', emoji: '🏍️', price: 100 },
  { name: 'Car', emoji: '🚗', price: 250 },
];

export default function LivePartyRoom(props: LivePartyRoomProps) {
  const [warningOpen, setWarningOpen] = useState<Mode | null>(null);
  const [videoMode, setVideoMode] = useState(false);

  useEffect(() => {
    setVideoMode(props.mode !== 'voice');
  }, [props.mode]);

  const requestMode = (mode: Mode) => setWarningOpen(mode);
  const confirmMode = () => {
    if (!warningOpen) return;
    props.onModeRequest(warningOpen);
    setWarningOpen(null);
  };

  return (
    <section className="space-y-4">
      <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${props.theme} p-3 shadow-2xl`}>
        <div className="flex items-center justify-between">
          <button type="button" onClick={props.onBack} aria-label="Back to dashboard" className="flex items-center gap-1 rounded-xl bg-black/25 px-2 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Back</button>
          <div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-white/60">{props.mode} room</p><h1 className="font-black">{props.roomName}</h1><p className="text-[10px] text-white/60">ID {props.roomId}</p></div>
          <div className="flex gap-1"><button type="button" onClick={props.onInvite} aria-label="Share room" className="rounded-full bg-black/25 p-2"><Share2 className="h-4 w-4" /></button><button type="button" onClick={props.onTheme} aria-label="Change room theme" className="rounded-full bg-black/25 p-2"><Radio className="h-4 w-4" /></button></div>
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto">{(['voice', 'video', 'live'] as Mode[]).map((mode) => <button type="button" key={mode} onClick={() => requestMode(mode)} className={`whitespace-nowrap rounded-lg px-2 py-1.5 text-[10px] font-black ${props.mode === mode ? 'bg-white text-gray-900' : 'bg-black/20 text-white/70'}`}>{mode === 'voice' ? 'Voice Party' : mode === 'video' ? 'Video Party' : 'Video Live Stream'}</button>)}</div>
        <div className="relative mt-3 aspect-video overflow-hidden rounded-2xl bg-black/45">{props.youtubeVideoId ? <iframe title="YouTube room stream" src={`https://www.youtube.com/embed/${props.youtubeVideoId}?autoplay=1&enablejsapi=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" /> : videoMode && props.stream ? <video ref={props.videoRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-white/45"><Mic className="h-8 w-8" /><span className="text-xs">Voice room · microphone active</span></div>}
          <div className="absolute inset-x-0 bottom-0 flex max-h-[58%] flex-col justify-end bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2 pt-12">
            <div className="mb-2 flex items-center justify-between text-[10px] font-black"><span>👀 {props.viewerCount.toLocaleString()} watching</span><span className="text-white/60">Live chat</span></div>
            <div className="max-h-24 space-y-1 overflow-y-auto pr-1">{props.messages.slice(-5).map((item) => <p key={item.id} className="text-xs leading-4 drop-shadow"><strong className="text-rose-200">{item.sender}: </strong><span className="text-white/85">{item.body}</span></p>)}</div>
            <form onSubmit={props.onSendMessage} className="mt-2 flex gap-1.5"><input value={props.message} onChange={(event) => props.onMessageChange(event.target.value)} placeholder="Say something..." className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-2.5 py-2 text-xs text-white outline-none placeholder:text-white/45" /><button type="submit" aria-label="Send chat message" className="rounded-lg bg-rose-500 p-2"><Send className="h-3.5 w-3.5" /></button></form>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-black"><Youtube className="h-4 w-4 text-red-400" />YouTube theater stream</div><div className="flex gap-2"><input value={props.youtubeQuery} onChange={(event) => props.onYoutubeQueryChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') props.onResolveYoutube(); }} placeholder="Search a song or paste a YouTube URL" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs outline-none" /><button type="button" onClick={props.onResolveYoutube} disabled={props.youtubeSearchLoading} className="flex items-center gap-1 rounded-xl bg-red-500 px-3 text-xs font-black"><Search className="h-3.5 w-3.5" />{props.youtubeSearchLoading ? '...' : 'Search'}</button></div>{props.youtubeSearchMessage && <p className="mt-2 text-[11px] text-white/55">{props.youtubeSearchMessage}</p>}{props.youtubeVideoId && <a href={`https://www.youtube.com/watch?v=${props.youtubeVideoId}`} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-lg bg-white px-3 py-2 text-xs font-black text-gray-900">Open in YouTube</a>}</div>
        {props.mediaError && <p className="mt-2 text-xs text-amber-200">{props.mediaError}</p>}
        {props.mode === 'voice' && <div className="mt-4 grid grid-cols-5 gap-2">{props.seats.map((seat) => <button type="button" key={seat} onClick={() => props.onSeat(seat)} className="rounded-xl border border-white/10 bg-black/15 p-2"><div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><Mic className="h-4 w-4 text-amber-200" /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${props.levels[seat - 1] || 0}%` }} /></div><span className="mt-1 block text-[9px] text-white/50">Seat {seat}</span></button>)}</div>}
      </div>
      <div className="rounded-2xl bg-amber-300/10 p-3 ring-1 ring-amber-200/10"><h2 className="flex items-center gap-2 text-sm font-black"><Gift className="h-4 w-4 text-amber-300" />Send a gift to the host</h2><div className="mt-2 grid grid-cols-4 gap-1.5">{gifts.map((gift) => <button type="button" key={gift.name} onClick={() => props.onGift(gift)} className="rounded-xl bg-white/10 p-2 text-center transition hover:-translate-y-0.5 hover:bg-rose-500/20"><div className="text-2xl">{gift.emoji}</div><p className="mt-1 text-[10px] font-black">{gift.name}</p><p className="text-[10px] text-amber-200">{gift.price} coins</p></button>)}</div></div>
      {warningOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4"><motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-3xl bg-[#241b36] p-6 shadow-2xl ring-1 ring-red-300/30"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-red-200">Before you start</h2><button type="button" onClick={() => setWarningOpen(null)}><X /></button></div><p className="mt-4 text-sm leading-6 text-white/75">WARNING: Pornography, nudity, violence, or adult content is strictly prohibited. Violations will lead to an immediate ban and permanent account suspension.</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => setWarningOpen(null)} className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-bold text-white/70">Cancel</button><button type="button" onClick={confirmMode} className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-black text-white">I Agree & Start</button></div></motion.div></div>}
    </section>
  );
}
