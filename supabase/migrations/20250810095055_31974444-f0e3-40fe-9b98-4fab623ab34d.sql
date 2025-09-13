-- Create a public RPC to fetch available schools and sport names for unauthenticated users
create or replace function public.rpc_public_available_schools()
returns table (
  id uuid,
  display_name text,
  name text,
  city text,
  cover_url text,
  sport_names text[],
  has_open_slots boolean
)
language sql
stable
security definer
set search_path = public
as $$
with active_schools as (
  select id, display_name, name, city, cover_url
  from public.schools
  where coalesce(is_active, true) = true
),
-- Active sports mapped via school_sports
sports_map as (
  select ss.school_id, array_agg(distinct sp.name) as sport_names
  from public.school_sports ss
  join public.sports sp on sp.id = ss.sport_id
  where ss.active = true
  group by ss.school_id
),
-- Schools that currently have open future time slots
open_slots as (
  select distinct school_id
  from public.time_slots
  where status = 'open'
    and date >= current_date
)
select s.id,
       s.display_name,
       s.name,
       s.city,
       s.cover_url,
       coalesce(sm.sport_names, '{}') as sport_names,
       (os.school_id is not null) as has_open_slots
from active_schools s
left join sports_map sm on sm.school_id = s.id
left join open_slots os on os.school_id = s.id
order by s.display_name nulls last, s.name;
$$;

-- Allow public (anon) and authenticated roles to execute
grant execute on function public.rpc_public_available_schools() to anon, authenticated;