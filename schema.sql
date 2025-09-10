-- Fluryy v1.2.5 Supabase schema

-- Pets table
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

-- Groomers table
create table if not exists public.groomers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  exp integer,
  areas text,
  skills text[],
  bio text,
  avail_from time,
  avail_to time,
  created_at timestamp with time zone default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  phone text,
  service text,
  starts_at timestamptz,
  address text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Contacts table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  topic text,
  preferred_time text,
  created_at timestamp with time zone default now()
);

-- Waitlist table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  locality text,
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.pets enable row level security;
create policy "Owners can manage their pets" on public.pets
  for all using (auth.uid() = owner_id);

alter table public.groomers enable row level security;
create policy "Groomer can manage own profile" on public.groomers
  for all using (auth.uid() = user_id);

alter table public.bookings enable row level security;
create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);
