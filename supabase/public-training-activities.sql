-- Run once in the Supabase SQL Editor. Public readers receive only these
-- explicitly selected workout fields; the private table's RLS stays intact.
create or replace function public.public_training_activities()
returns table (activity jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'date', sessions.payload -> 'date',
    'workout', sessions.payload -> 'template_label',
    'period', sessions.payload -> 'period',
    'duration_minutes', sessions.payload -> 'duration_minutes',
    'session_rpe', sessions.payload -> 'session_rpe',
    'notes', sessions.payload -> 'notes',
    'weight_unit', sessions.payload -> 'weight_unit',
    'exercises', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', exercise -> 'name',
        'mode', exercise -> 'mode',
        'note', exercise -> 'note',
        'sets', coalesce((
          select jsonb_agg(jsonb_build_object(
            'weight', recorded_set -> 'weight',
            'reps', recorded_set -> 'reps',
            'duration', recorded_set -> 'duration',
            'distance', recorded_set -> 'distance',
            'rpe', recorded_set -> 'rpe'
          )) from jsonb_array_elements(coalesce(exercise -> 'sets', '[]'::jsonb)) as recorded_set
        ), '[]'::jsonb)
      )) from jsonb_array_elements(coalesce(sessions.payload -> 'exercises', '[]'::jsonb)) as exercise
    ), '[]'::jsonb)
  )
  from public.training_sessions as sessions
  join auth.users as account on account.id = sessions.user_id
  where exists (
    select 1 from public.dashboard_allowed_emails as allowed
    where lower(allowed.email) = lower(account.email) and allowed.role = 'owner'
  )
  order by sessions.occurred_at desc
  limit 100;
$$;

revoke all on function public.public_training_activities() from public;
grant execute on function public.public_training_activities() to anon, authenticated;
