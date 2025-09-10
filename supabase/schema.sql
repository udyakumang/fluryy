
-- Fluryy Supabase schema (v1.2.3)
create extension if not exists pgcrypto;

-- P E T S
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  species text check (species in ('dog','cat')),
  breed text,
  birthdate date,
  weight numeric,
  notes text,
  created_at timestamp with time zone default now()
);

-- G R O O M E R S
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
  created_at timestamp with time zone default now()
);

-- B O O K I N G S
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  service text,
  date date,
  time text,
  address text,
  status text default 'pending',
  razorpay_payment_id text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.pets enable row level security;
alter table public.groomers enable row level security;
alter table public.bookings enable row level security;

-- Pets policies
create policy if not exists "pets_select_own" on public.pets
  for select using (auth.uid() = owner_id);
create policy if not exists "pets_insert_own" on public.pets
  for insert with check (auth.uid() = owner_id);
create policy if not exists "pets_update_own" on public.pets
  for update using (auth.uid() = owner_id);
create policy if not exists "pets_delete_own" on public.pets
  for delete using (auth.uid() = owner_id);

-- Groomers policies
create policy if not exists "groomers_select_self" on public.groomers
  for select using (auth.uid() = user_id);
create policy if not exists "groomers_upsert_self" on public.groomers
  for insert with check (auth.uid() = user_id);
create policy if not exists "groomers_update_self" on public.groomers
  for update using (auth.uid() = user_id);

-- Bookings policies
create policy if not exists "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);
create policy if not exists "bookings_insert_own" on public.bookings
  for insert with check (auth.uid() = user_id);
create policy if not exists "bookings_update_own" on public.bookings
  for update using (auth.uid() = user_id);
