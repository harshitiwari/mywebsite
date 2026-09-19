-- Private training data. Run this once in Supabase SQL Editor.
-- This table is deliberately separate from the public Jekyll website.
create extension if not exists pgcrypto;

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id text not null,
  occurred_at timestamptz not null default now(),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.training_sessions enable row level security;

create policy "Users read only their training sessions"
on public.training_sessions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users add only their training sessions"
on public.training_sessions for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update only their training sessions"
on public.training_sessions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete only their training sessions"
on public.training_sessions for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists training_sessions_user_time_idx
on public.training_sessions (user_id, occurred_at desc);
