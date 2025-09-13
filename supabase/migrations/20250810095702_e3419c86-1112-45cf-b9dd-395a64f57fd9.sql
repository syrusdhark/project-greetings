-- Fix ambiguous column reference in rpc_create_hold return statement
create or replace function public.rpc_create_hold(
  p_user_id uuid,
  p_school_id uuid,
  p_sport_id uuid,
  p_time_slot_id uuid,
  p_amount numeric
)
returns table(booking_id uuid, booking_code text, expires_at timestamp with time zone)
language plpgsql
security definer
as $$
declare
  v_capacity int;
  v_seats_left int;
  v_active_holds int;
  v_booking_id uuid;
  v_booking_code text;
  v_slot_date date;
  v_slot_start time without time zone;
  v_slot_end time without time zone;
  v_sport_name text;
  v_customer_name text;
  v_customer_email text;
begin
  if p_time_slot_id is not null then
    select capacity, seats_left, date, start_time, end_time
      into v_capacity, v_seats_left, v_slot_date, v_slot_start, v_slot_end
    from public.time_slots
    where id = p_time_slot_id
    for update;

    if not found then
      raise exception 'Time slot not found';
    end if;

    select count(*) into v_active_holds
    from public.bookings b
    join public.holds h on h.booking_id = b.id
    where b.time_slot_id = p_time_slot_id
      and b.status in ('held','awaiting_verification')
      and h.expires_at > now();

    if (v_capacity - v_seats_left) + v_active_holds >= v_capacity then
      raise exception 'No seats available for this slot';
    end if;
  end if;

  select name into v_sport_name from public.sports where id = p_sport_id;

  -- Pull customer name/email from user_profiles; provide safe fallbacks
  select 
    coalesce(nullif(trim(coalesce(up.first_name,'') || ' ' || coalesce(up.last_name,'')), ''), 'Guest') as customer_name,
    coalesce(up.email, 'guest@example.com') as customer_email
  into v_customer_name, v_customer_email
  from public.user_profiles up
  where up.user_id = p_user_id
  limit 1;

  v_booking_code := public.generate_booking_code();

  insert into public.bookings (
    user_id, school_id, sport_id, time_slot_id, status, amount, booking_code, created_at,
    booking_date, time_slot, activity_booked, customer_name, customer_email
  ) values (
    p_user_id, p_school_id, p_sport_id, p_time_slot_id, 'held', p_amount, v_booking_code, now(),
    coalesce(v_slot_date, now()::date),
    case when v_slot_start is null then 'TBD' else to_char(v_slot_start, 'HH24:MI') || '-' || to_char(v_slot_end, 'HH24:MI') end,
    coalesce(v_sport_name, 'Activity'),
    v_customer_name,
    v_customer_email
  )
  returning id into v_booking_id;

  insert into public.holds (booking_id, expires_at)
  values (v_booking_id, now() + interval '2 minutes');

  return query
  select v_booking_id, v_booking_code, h.expires_at
  from public.holds h
  where h.booking_id = v_booking_id
  limit 1;
end;
$$;