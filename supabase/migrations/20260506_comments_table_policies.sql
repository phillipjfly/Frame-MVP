create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments are viewable by everyone"
on public.comments
for select
using (true);

create policy "authenticated users can comment"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete own comments"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id);
