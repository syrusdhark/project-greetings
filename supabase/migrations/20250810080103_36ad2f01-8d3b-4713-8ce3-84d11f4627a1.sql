-- Create public RPC to fetch active sports with pricing for a school (bypasses RLS safely)
create or replace function public.rpc_get_school_sports(p_school_id uuid)
returns table(
  sport_id uuid,
  sport_name text,
  price_per_person numeric,
  currency text
)
language sql
stable
security definer
set search_path = public
as $$
  select ss.sport_id,
         s.name as sport_name,
         ss.price_per_person,
         ss.currency
  from public.school_sports ss
  join public.sports s on s.id = ss.sport_id
  where ss.school_id = p_school_id
    and ss.active = true;
$$;