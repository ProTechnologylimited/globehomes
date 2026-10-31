-- Run in the Supabase SQL editor.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  name text not null,
  email text not null,
  preferred_date date not null,
  priority boolean not null default false,
  amount_usd integer not null check (amount_usd > 0),
  status text not null default 'pending' check (status in ('pending','paid','expired')),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);
create index if not exists bookings_status_idx on public.bookings (status);

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  active boolean not null default true,
  sort integer not null default 0
);

create table if not exists public.listings (
  id text primary key,
  cc text not null,
  city text not null,
  title text not null,
  mode text not null check (mode in ('buy','rent','invest')),
  category text not null,
  price integer not null check (price > 0),
  beds integer not null default 0,
  baths integer not null default 0,
  sqm integer not null default 0,
  yield numeric,
  image_url text,
  inspection_fee_override integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- RLS on with no policies: only the server (service role key) can read or write.
alter table public.bookings   enable row level security;
alter table public.categories enable row level security;
alter table public.listings   enable row level security;
alter table public.settings   enable row level security;

-- Public bucket for listing photos uploaded from the admin panel.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;
