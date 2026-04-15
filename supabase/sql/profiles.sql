-- profiles table for Frame auth profile data
create table if not exists public.profiles (
id uuid primary key references auth.users(id) on delete cascade,
username text not null unique,
display_name text,
bio text,
avatar_url text,
created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- read profiles: public
create policy "profiles_select_public"
on public.profiles
for select
using (true);

-- insert own profile only
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

-- update own profile only
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);