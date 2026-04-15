-- Frame MVP schema migration
-- Run this in Supabase SQL editor

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

-- posts table
create table if not exists public.posts (
id uuid primary key default gen_random_uuid(),
user_id uuid not null references auth.users(id) on delete cascade,
image_url text not null,
caption text,
tags text[],
created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- read posts: public
create policy "posts_select_public"
on public.posts
for select
using (true);

-- insert own posts only
create policy "posts_insert_own"
on public.posts
for insert
with check (auth.uid() = user_id);

-- update own posts only
create policy "posts_update_own"
on public.posts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- delete own posts only
create policy "posts_delete_own"
on public.posts
for delete
using (auth.uid() = user_id);

-- likes table
create table if not exists public.likes (
id uuid primary key default gen_random_uuid(),
post_id uuid not null references public.posts(id) on delete cascade,
user_id uuid not null references auth.users(id) on delete cascade,
created_at timestamptz not null default now(),
unique(post_id, user_id)
);

alter table public.likes enable row level security;

-- read likes: public
create policy "likes_select_public"
on public.likes
for select
using (true);

-- insert own likes only
create policy "likes_insert_own"
on public.likes
for insert
with check (auth.uid() = user_id);

-- delete own likes only
create policy "likes_delete_own"
on public.likes
for delete
using (auth.uid() = user_id);

-- comments table
create table if not exists public.comments (
id uuid primary key default gen_random_uuid(),
post_id uuid not null references public.posts(id) on delete cascade,
user_id uuid not null references auth.users(id) on delete cascade,
text text not null,
created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- read comments: public
create policy "comments_select_public"
on public.comments
for select
using (true);

-- insert own comments only
create policy "comments_insert_own"
on public.comments
for insert
with check (auth.uid() = user_id);

-- update own comments only
create policy "comments_update_own"
on public.comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- delete own comments only
create policy "comments_delete_own"
on public.comments
for delete
using (auth.uid() = user_id);