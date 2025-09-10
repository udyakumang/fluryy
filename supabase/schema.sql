-- v1.2.4 additions
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

alter table public.bookings add column if not exists starts_at timestamptz;
