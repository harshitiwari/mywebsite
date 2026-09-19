-- Run this migration in Supabase SQL Editor for the existing project.
-- It changes the dashboard from "any signed-in user has their own data"
-- to "only explicitly approved emails may use the dashboard".

create table if not exists public.dashboard_allowed_emails (
  email text primary key,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

alter table public.dashboard_allowed_emails enable row level security;

create or replace function public.my_dashboard_access()
returns table (role text)
language sql
stable
security definer
set search_path = public
as $$
  select allowed.role
  from public.dashboard_allowed_emails as allowed
  where lower(allowed.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

grant execute on function public.my_dashboard_access() to authenticated;

create or replace function public.can_use_training_dashboard()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dashboard_allowed_emails as allowed
    where lower(allowed.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.can_use_training_dashboard() to authenticated;

drop policy if exists "Users read only their training sessions" on public.training_sessions;
drop policy if exists "Users add only their training sessions" on public.training_sessions;
drop policy if exists "Users update only their training sessions" on public.training_sessions;
drop policy if exists "Users delete only their training sessions" on public.training_sessions;

create policy "Approved members read only their training sessions"
on public.training_sessions for select to authenticated
using ((select public.can_use_training_dashboard()) and (select auth.uid()) = user_id);

create policy "Approved members add only their training sessions"
on public.training_sessions for insert to authenticated
with check ((select public.can_use_training_dashboard()) and (select auth.uid()) = user_id);

create policy "Approved members update only their training sessions"
on public.training_sessions for update to authenticated
using ((select public.can_use_training_dashboard()) and (select auth.uid()) = user_id)
with check ((select public.can_use_training_dashboard()) and (select auth.uid()) = user_id);

create policy "Approved members delete only their training sessions"
on public.training_sessions for delete to authenticated
using ((select public.can_use_training_dashboard()) and (select auth.uid()) = user_id);

-- Replace with the email you use to sign into the dashboard, then run it once.
-- insert into public.dashboard_allowed_emails (email, role)
-- values ('you@example.com', 'owner');
