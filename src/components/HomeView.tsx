import { useState } from 'react';
import { Radio, Share2, UserRound } from 'lucide-react';

type Person = { id: string; displayName: string; city: string; avatarUrl: string };
type HomeViewProps = { people: Person[]; onRoom: () => void; onProfile: (person: Person) => void; onInvite: () => void };

type Filter = 'Related' | 'Explore rooms' | 'Event';

export default function HomeView({ people, onRoom, onProfile, onInvite }: HomeViewProps) {
  const [filter, setFilter] = useState<Filter>('Related');
  const shownPeople = filter === 'Event' ? [...people].reverse() : people;

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Home · {filter}</p><h1 className="mt-2 text-3xl font-black">{filter === 'Event' ? 'Upcoming events.' : filter === 'Explore rooms' ? 'Explore live rooms.' : 'Made for you.'}</h1></div>
        <button type="button" onClick={onInvite} aria-label="Invite friends" className="rounded-full bg-white/10 p-3"><Share2 className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-2">{(['Related', 'Explore rooms', 'Event'] as Filter[]).map((item) => <button type="button" key={item} onClick={() => { setFilter(item); if (item === 'Explore rooms') onRoom(); }} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? 'bg-white text-[#171326]' : 'bg-white/10 text-white/60'}`}>{item}</button>)}</div>
      <button type="button" onClick={onRoom} className="w-full rounded-3xl bg-gradient-to-br from-rose-600 via-fuchsia-700 to-indigo-950 p-6 text-left shadow-2xl"><p className="text-xs font-black uppercase tracking-widest text-white/60">{filter === 'Event' ? 'Featured event' : 'Live now'}</p><h2 className="mt-2 text-2xl font-black">Midnight Voice Lounge</h2><p className="mt-2 text-sm text-white/70">Join the conversation · 128 listeners</p><Radio className="mt-5 h-8 w-8" /></button>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{shownPeople.slice(0, 8).map((person) => <button type="button" key={person.id} onClick={() => onProfile(person)} className="overflow-hidden rounded-2xl bg-white/5 text-left ring-1 ring-white/10"><div className="flex h-32 items-center justify-center bg-gradient-to-br from-violet-700 to-rose-500">{person.avatarUrl ? <img src={person.avatarUrl} alt={person.displayName} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-white/50" />}</div><p className="truncate p-3 text-sm font-bold">{person.displayName}</p></button>)}</div>
    </section>
  );
}
