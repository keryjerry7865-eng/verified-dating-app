create extension if not exists pgcrypto;

create table if not exists public.voice_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  mode text not null default 'voice' check (mode in ('voice','video','live')),
  theme text not null default 'from-rose-600 via-fuchsia-700 to-violet-900',
  viewer_count integer not null default 0,
  is_live boolean not null default true,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.voice_rooms(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text not null default 'Guest',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid not null references auth.users(id) on delete cascade,
  liked_id uuid not null references auth.users(id) on delete cascade,
  is_mutual boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create index if not exists idx_voice_rooms_live on public.voice_rooms (is_live, viewer_count desc);
create index if not exists idx_room_messages_room_created on public.room_messages (room_id, created_at desc);
create index if not exists idx_moments_created on public.moments (created_at desc);
create index if not exists idx_likes_liker on public.likes (liker_id);
create index if not exists idx_likes_liked on public.likes (liked_id);

alter table public.voice_rooms enable row level security;
alter table public.room_messages enable row level security;
alter table public.moments enable row level security;
alter table public.likes enable row level security;
alter table public.matches enable row level security;

create policy if not exists "voice_rooms are readable by authenticated users"
on public.voice_rooms for select
using (auth.role() = 'authenticated');

create policy if not exists "voice_rooms are writable by authenticated users"
on public.voice_rooms for insert
with check (auth.role() = 'authenticated');

create policy if not exists "room_messages are readable by authenticated users"
on public.room_messages for select
using (auth.role() = 'authenticated');

create policy if not exists "room_messages are writable by authenticated users"
on public.room_messages for insert
with check (auth.role() = 'authenticated');

create policy if not exists "moments are readable by authenticated users"
on public.moments for select
using (auth.role() = 'authenticated');

create policy if not exists "moments are writable by authenticated users"
on public.moments for insert
with check (auth.role() = 'authenticated');

create policy if not exists "likes are readable by authenticated users"
on public.likes for select
using (auth.role() = 'authenticated');

create policy if not exists "likes are writable by authenticated users"
on public.likes for insert
with check (auth.role() = 'authenticated');

create policy if not exists "matches are readable by authenticated users"
on public.matches for select
using (auth.role() = 'authenticated');

create policy if not exists "matches are writable by authenticated users"
on public.matches for insert
with check (auth.role() = 'authenticated');

insert into public.voice_rooms (host_id, name, description, mode, theme, viewer_count, slug)
values
  ('00000000-0000-0000-0000-000000000000', 'Midnight Voice Lounge', 'Late-night chat and warm voices.', 'voice', 'from-rose-600 via-fuchsia-700 to-violet-900', 128, 'midnight-voice-lounge')
on conflict (slug) do nothing;
