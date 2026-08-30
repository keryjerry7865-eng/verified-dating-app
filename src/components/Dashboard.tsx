import { useEffect, useMemo, useState } from 'react';
import { Bell, Heart, LogOut, MessageCircle, Send, UserRound, X, Radio, Coins } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { normalizeProfile, readLocalProfile, type LocalProfile } from '../lib/profileFallback';
import { readWallet, writeWallet, type WalletState } from '../lib/wallet';
import CoinStore from './CoinStore';
import GiftAnimation from './GiftAnimation';
import GiftPanel, { type GiftOption } from './GiftPanel';

type Profile = LocalProfile & { displayName?: string };
type DashboardProps = { session: Session; onSignOut: () => void };
type Alert = { id: string; text: string };

export default function Dashboard({ session, onSignOut }: DashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [discoverProfiles, setDiscoverProfiles] = useState<Profile[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<Profile[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const [selectedChat, setSelectedChat] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<{ id: string; sender_id: string; receiver_id: string; body: string }[]>([]);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'swipe' | 'likes' | 'chat' | 'live'>('swipe');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wallet, setWallet] = useState<WalletState>(() => readWallet(session.user.id));
  const [storeOpen, setStoreOpen] = useState(false);
  const [activeGift, setActiveGift] = useState<GiftOption | null>(null);
  const displayName = session.user.user_metadata?.display_name || session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'LoveMatch member';

  const profileName = (item: Profile) => item.displayName || (item.id === session.user.id ? displayName : `Member ${item.id.slice(0, 6)}`);

  const pushAlert = (text: string) => {
    const alert = { id: crypto.randomUUID(), text };
    setAlerts((current) => [...current, alert]);
    window.setTimeout(() => setAlerts((current) => current.filter((item) => item.id !== alert.id)), 5000);
  };

  useEffect(() => {
    writeWallet(session.user.id, wallet);
  }, [session.user.id, wallet]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [{ data: current }, { data: others }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('profiles').select('*').neq('id', session.user.id).limit(20),
      ]);
      const localProfile = readLocalProfile(session.user.id);
      const remoteProfile = normalizeProfile(session.user.id, current as Record<string, unknown> | null);
      setProfile(remoteProfile ? { ...localProfile, ...remoteProfile, age: remoteProfile.age ?? localProfile?.age ?? null, gender: remoteProfile.gender || localProfile?.gender || '', city: remoteProfile.city || localProfile?.city || '', bio: remoteProfile.bio || localProfile?.bio || '', interests: remoteProfile.interests.length ? remoteProfile.interests : localProfile?.interests || [], avatarUrl: remoteProfile.avatarUrl || localProfile?.avatarUrl || '', latitude: remoteProfile.latitude ?? localProfile?.latitude ?? null, longitude: remoteProfile.longitude ?? localProfile?.longitude ?? null } : localProfile);
      setDiscoverProfiles((others || []).map((item) => normalizeProfile(String(item.id), item as Record<string, unknown>)).filter((item): item is LocalProfile => Boolean(item)));

      const { data: matchRows } = await supabase
        .from('matches')
        .select('user_one,user_two')
        .or(`user_one.eq.${session.user.id},user_two.eq.${session.user.id}`);
      const matchIds = (matchRows || []).map((match) => match.user_one === session.user.id ? match.user_two : match.user_one);
      if (matchIds.length) {
        const { data: matchProfiles } = await supabase.from('profiles').select('*').in('id', matchIds);
        setLikedProfiles((matchProfiles || []).map((item) => normalizeProfile(String(item.id), item as Record<string, unknown>)).filter((item): item is LocalProfile => Boolean(item)));
      }

      const { data: incomingRows } = await supabase.from('likes').select('liker_id').eq('liked_id', session.user.id);
      const incomingIds = (incomingRows || []).map((like) => like.liker_id);
      if (incomingIds.length) {
        const { data: incomingProfiles } = await supabase.from('profiles').select('*').in('id', incomingIds);
        setIncomingLikes((incomingProfiles || []).map((item) => normalizeProfile(String(item.id), item as Record<string, unknown>)).filter((item): item is LocalProfile => Boolean(item)));
      }
    };
    loadDashboard();
  }, [session.user.id]);

  useEffect(() => {
    const channel = supabase.channel(`notifications:${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes', filter: `liked_id=eq.${session.user.id}` }, (payload) => {
        pushAlert(payload.new.is_mutual ? 'It’s a match! Someone likes you back.' : 'You have a new like.');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.new.user_one === session.user.id || payload.new.user_two === session.user.id) pushAlert('New mutual match!');
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [session.user.id]);

  useEffect(() => {
    if (!selectedChat) return;
    const channel = supabase.channel(`messages:${session.user.id}:${selectedChat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const message = payload.new as typeof messages[number];
        if ([message.sender_id, message.receiver_id].includes(session.user.id) && [message.sender_id, message.receiver_id].includes(selectedChat.id)) {
          setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
        }
      })
      .subscribe();

    const loadMessages = async () => {
      const { data } = await supabase.from('messages').select('id,sender_id,receiver_id,body').or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${session.user.id})`).order('created_at');
      setMessages(data || []);
    };
    loadMessages();
    return () => { void supabase.removeChannel(channel); };
  }, [selectedChat, session.user.id]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedChat || !messageText.trim()) return;
    const body = messageText.trim();
    setMessageText('');
    const { error } = await supabase.from('messages').insert({ sender_id: session.user.id, receiver_id: selectedChat.id, body });
    if (error) pushAlert(error.message);
  };

  const purchaseCoins = (coins: number) => {
    setWallet((current) => ({ ...current, coins: current.coins + coins, purchasedCoins: current.purchasedCoins + coins }));
    setStoreOpen(false);
    pushAlert(`${coins} coins added to your wallet.`);
  };

  const sendGift = (gift: GiftOption, recipientId = selectedChat?.id || session.user.id) => {
    if (wallet.coins < gift.coins) {
      setStoreOpen(true);
      pushAlert(`You need ${gift.coins - wallet.coins} more coins for this gift.`);
      return;
    }

    const giftRecord = { id: crypto.randomUUID(), gift: gift.name, emoji: gift.emoji, coins: gift.coins, recipientId, createdAt: new Date().toISOString() };
    setWallet((current) => ({ ...current, coins: current.coins - gift.coins, receivedGifts: [...current.receivedGifts, giftRecord] }));
    setActiveGift(gift);
    pushAlert(`${gift.name} sent for ${gift.coins} coins.`);
  };

  const likeProfile = async (target: Profile) => {
    const { data: reciprocal } = await supabase.from('likes').select('id').eq('liker_id', target.id).eq('liked_id', session.user.id).maybeSingle();
    const isMutual = Boolean(reciprocal);
    const { error } = await supabase.from('likes').insert({ liker_id: session.user.id, liked_id: target.id, is_mutual: isMutual });
    if (error) { pushAlert(error.message); return; }
    setDiscoverProfiles((current) => current.filter((item) => item.id !== target.id));
    if (isMutual) {
      const [userOne, userTwo] = [session.user.id, target.id].sort();
      const { error: matchError } = await supabase.from('matches').upsert({ user_one: userOne, user_two: userTwo }, { onConflict: 'user_one,user_two' });
      if (matchError) {
        pushAlert(matchError.message);
        return;
      }
      setLikedProfiles((current) => current.some((item) => item.id === target.id) ? current : [...current, target]);
      pushAlert(`You matched with ${profileName(target)}!`);
    }
  };

  const currentCard = discoverProfiles[0];
  const unreadCount = alerts.length;
  const tabs = useMemo(() => [
    { id: 'swipe' as const, label: 'Swipe', icon: Heart },
    { id: 'likes' as const, label: 'Likes', icon: Bell },
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
    { id: 'live' as const, label: 'Live', icon: Radio },
  ], []);

  return (
    <main className="min-h-screen bg-[#fffaf8] pb-24">
      <CoinStore open={storeOpen} onClose={() => setStoreOpen(false)} onPurchase={purchaseCoins} />
      <GiftAnimation gift={activeGift} onClose={() => setActiveGift(null)} />
      <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3">{alerts.map((alert) => <div key={alert.id} className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-xl"><Bell className="h-4 w-4 text-rose-300" />{alert.text}<button className="ml-auto" onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}><X className="h-4 w-4" /></button></div>)}</div>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between"><div className="flex items-center gap-2"><Heart className="h-6 w-6 fill-rose-500 text-rose-500" /><span className="text-xl font-black text-gray-900">LoveMatch</span></div><div className="flex items-center gap-3"><button onClick={() => setAlerts([])} className="relative rounded-full p-2 text-gray-600 hover:bg-rose-50"><Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}</button>{profile?.avatarUrl ? <img src={profile.avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-100" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500"><UserRound className="h-5 w-5" /></div>}<button onClick={onSignOut} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800" aria-label="Sign out"><LogOut className="h-5 w-5" /></button></div></div></header>
      <div className="mx-auto max-w-5xl px-4 py-8"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-500">Good to see you</p><h1 className="mt-1 text-4xl font-black text-gray-900">{displayName}.</h1><p className="mt-2 text-gray-500">{profile?.bio || 'Discover people who are close to your kind of wonderful.'}</p><button type="button" onClick={() => setStoreOpen(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 shadow-sm hover:bg-amber-300"><Coins className="h-4 w-4" />{wallet.coins} coins</button></div>
        {activeTab === 'swipe' && <section className="mx-auto max-w-lg"><div className="relative overflow-hidden rounded-[2rem] bg-gray-900 shadow-2xl">{currentCard?.avatarUrl ? <img src={currentCard.avatarUrl} alt={profileName(currentCard)} className="h-[28rem] w-full object-cover opacity-90" /> : <div className="flex h-[28rem] items-center justify-center bg-gradient-to-br from-rose-300 via-orange-200 to-violet-300"><UserRound className="h-24 w-24 text-white/70" /></div>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24 text-white"><h2 className="text-3xl font-black">{currentCard ? `${profileName(currentCard)}, ${currentCard.age}` : 'No more profiles'}</h2><p className="mt-1 text-sm text-white/80">{currentCard?.city || 'Check back soon'} {currentCard && `· ${currentCard.interests?.slice(0, 2).join(' · ')}`}</p></div></div>{currentCard && <div className="mt-5 flex justify-center gap-4"><button onClick={() => setDiscoverProfiles((current) => current.slice(1))} className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-500 shadow-lg ring-1 ring-gray-100"><X /></button><button onClick={() => void likeProfile(currentCard)} className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200"><Heart className="fill-current" /></button></div>}</section>}
        {activeTab === 'live' && <section className="mx-auto max-w-2xl"><div className="relative flex h-80 items-center justify-center overflow-hidden rounded-[2rem] bg-gray-950 shadow-2xl"><div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />LIVE</div><Radio className="h-20 w-20 text-white/20" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24"><p className="text-xl font-black text-white">Live room</p><p className="text-sm text-white/70">Send a gift to make the moment memorable.</p></div></div><div className="mt-5"><GiftPanel coins={wallet.coins} onSend={(gift) => sendGift(gift)} onOpenStore={() => setStoreOpen(true)} /></div></section>}
        {activeTab === 'likes' && <section><h2 className="text-2xl font-black text-gray-900">Who likes you</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{incomingLikes.length ? incomingLikes.map((item) => <ProfileTile key={item.id} profile={item} onChat={() => { setSelectedChat(item); setActiveTab('chat'); }} />) : <EmptyState text="Your new likes will appear here in real time." />}</div></section>}
        {activeTab === 'chat' && <section className="grid gap-5 lg:grid-cols-[18rem_1fr]"><div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100"><h2 className="p-3 text-xl font-black">Messages</h2>{likedProfiles.map((item) => <button key={item.id} onClick={() => setSelectedChat(item)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-rose-50 ${selectedChat?.id === item.id ? 'bg-rose-50' : ''}`}><div className="h-10 w-10 rounded-full bg-rose-100" /> <span className="text-sm font-bold">{profileName(item)}</span></button>)}{!likedProfiles.length && <p className="p-3 text-xs text-gray-500">Chat becomes available after a mutual match.</p>}</div><div className="min-h-[24rem] rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">{selectedChat ? <><h2 className="border-b border-gray-100 pb-4 text-xl font-black">Chat with {profileName(selectedChat)}</h2><div className="flex h-72 flex-col gap-2 overflow-y-auto py-4">{messages.map((message) => <div key={message.id} className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${message.sender_id === session.user.id ? 'self-end bg-rose-500 text-white' : 'bg-gray-100 text-gray-800'}`}>{message.body}</div>)}</div><GiftPanel coins={wallet.coins} onSend={(gift) => sendGift(gift, selectedChat.id)} onOpenStore={() => setStoreOpen(true)} /><form onSubmit={sendMessage} className="mt-4 flex gap-2"><input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-rose-400" /><button className="rounded-xl bg-gray-900 px-4 text-white"><Send className="h-4 w-4" /></button></form></> : <EmptyState text="Choose a match to start chatting." />}</div></section>}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 p-2 backdrop-blur"><div className="mx-auto grid max-w-lg grid-cols-3 gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${activeTab === id ? 'bg-rose-50 text-rose-600' : 'text-gray-500'}`}><Icon className="h-4 w-4" />{label}</button>)}</div></nav>
    </main>
  );
}

function ProfileTile({ profile, onChat }: { profile: Profile; onChat: () => void }) { return <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"><div className="h-14 w-14 rounded-full bg-rose-100" /> <div className="min-w-0 flex-1"><p className="truncate font-bold">{profile.displayName || `Member ${profile.id.slice(0, 6)}`}</p><p className="text-xs text-gray-500">{profile.city}</p></div><button onClick={onChat} className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white">Chat</button></div>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">{text}</div>; }
