create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  display_name text,
  full_name text,
  age integer,
  gender text,
  city text,
  bio text,
  avatar_url text,
  interests text[] not null default '{}'::text[],
  latitude double precision,
  longitude double precision,
  match_distance integer not null default 25,
  wallet_balance numeric(12, 2) not null default 1200,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists display_name text,
  add column if not exists full_name text,
  add column if not exists age integer,
  add column if not exists gender text,
  add column if not exists city text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists match_distance integer not null default 25,
  add column if not exists wallet_balance numeric(12, 2) not null default 1200,
  add column if not exists created_at timestamptz not null default now();
