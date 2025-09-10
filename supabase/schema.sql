
-- Fluryy v1.2.5 — Supabase schema
-- Run this in Supabase SQL editor (Project → SQL).

create extension if not exists pgcrypto;

-- PETS
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  species text check (species in ('dog','cat')),
  breed text,
  birthdate date,
  weight numeric,
  notes text,
  created_at timestamptz default now()
);
alter table public.pets enable row level security;
create policy if not exists "pets_select_own" on public.pets for select using (auth.uid() = owner_id);
create policy if not exists "pets_insert_own" on public.pets for insert with check (auth.uid() = owner_id);
create policy if not exists "pets_update_own" on public.pets for update using (auth.uid() = owner_id);
create policy if not exists "pets_delete_own" on public.pets for delete using (auth.uid() = owner_id);

-- GROOMERS
create table if not exists public.groomers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text,
  phone text,
  email text,
  exp int,
  areas text,
  skills text[],
  bio text,
  avail_from text,
  avail_to text,
  created_at timestamptz default now()
);
alter table public.groomers enable row level security;
create policy if not exists "groomers_select_self" on public.groomers for select using (auth.uid() = user_id);
create policy if not exists "groomers_upsert_self" on public.groomers for insert with check (auth.uid() = user_id);
create policy if not exists "groomers_update_self" on public.groomers for update using (auth.uid() = user_id);

-- BOOKINGS
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  service text,
  starts_at timestamptz,
  address text,
  status text default 'pending',
  razorpay_payment_id text,
  created_at timestamptz default now()
);
alter table public.bookings enable row level security;
create policy if not exists "bookings_select_own" on public.bookings for select using (auth.uid() = user_id);
create policy if not exists "bookings_insert_own" on public.bookings for insert with check (auth.uid() = user_id);
create policy if not exists "bookings_update_own" on public.bookings for update using (auth.uid() = user_id);

-- PUBLIC TABLES FOR MARKETING FORMS
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  locality text,
  created_at timestamptz default now()
);
alter table public.waitlist enable row level security;
create policy if not exists "waitlist_insert_public" on public.waitlist
for insert with check (true);
create policy if not exists "waitlist_read_admin_only" on public.waitlist
for select using (auth.role() = 'service_role'); -- or query via service key in server

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  topic text,
  preferred_time text,
  created_at timestamptz default now()
);
alter table public.contacts enable row level security;
create policy if not exists "contacts_insert_public" on public.contacts
for insert with check (true);
create policy if not exists "contacts_read_admin_only" on public.contacts
for select using (auth.role() = 'service_role');

-- Helpful index
create index if not exists bookings_user_time_idx on public.bookings(user_id, starts_at desc);
