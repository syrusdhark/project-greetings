-- Enforce authenticated inserts on bookings and ownership checks in RPCs

-- 1) Tighten RLS: only allow inserts when new.user_id = auth.uid()
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2) Update rpc_create_hold to require auth and user match
CREATE OR REPLACE FUNCTION public.rpc_create_hold(
  p_user_id uuid,
  p_school_id uuid,
  p_sport_id uuid,
  p_time_slot_id uuid,
  p_amount numeric
)
RETURNS TABLE(booking_id uuid, booking_code text, expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
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
BEGIN
  -- Auth required and must match provided user_id
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'User mismatch';
  END IF;

  IF p_time_slot_id IS NOT NULL THEN
    SELECT capacity, seats_left, date, start_time, end_time
      INTO v_capacity, v_seats_left, v_slot_date, v_slot_start, v_slot_end
    FROM public.time_slots
    WHERE id = p_time_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Time slot not found';
    END IF;

    SELECT count(*) INTO v_active_holds
    FROM public.bookings b
    JOIN public.holds h ON h.booking_id = b.id
    WHERE b.time_slot_id = p_time_slot_id
      AND b.status IN ('held','awaiting_verification')
      AND h.expires_at > now();

    IF (v_capacity - v_seats_left) + v_active_holds >= v_capacity THEN
      RAISE EXCEPTION 'No seats available for this slot';
    END IF;
  END IF;

  SELECT name INTO v_sport_name FROM public.sports WHERE id = p_sport_id;

  -- Pull customer name/email from user_profiles; provide safe fallbacks
  SELECT 
    coalesce(nullif(trim(coalesce(up.first_name,'') || ' ' || coalesce(up.last_name,'')), ''), 'Guest') AS customer_name,
    coalesce(up.email, 'guest@example.com') AS customer_email
  INTO v_customer_name, v_customer_email
  FROM public.user_profiles up
  WHERE up.user_id = p_user_id
  LIMIT 1;

  v_booking_code := public.generate_booking_code();

  INSERT INTO public.bookings (
    user_id, school_id, sport_id, time_slot_id, status, amount, booking_code, created_at,
    booking_date, time_slot, activity_booked, customer_name, customer_email
  ) VALUES (
    p_user_id, p_school_id, p_sport_id, p_time_slot_id, 'held', p_amount, v_booking_code, now(),
    coalesce(v_slot_date, now()::date),
    CASE WHEN v_slot_start IS NULL THEN 'TBD' ELSE to_char(v_slot_start, 'HH24:MI') || '-' || to_char(v_slot_end, 'HH24:MI') END,
    coalesce(v_sport_name, 'Activity'),
    v_customer_name,
    v_customer_email
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO public.holds (booking_id, expires_at)
  VALUES (v_booking_id, now() + interval '2 minutes');

  RETURN QUERY
  SELECT v_booking_id, v_booking_code, h.expires_at
  FROM public.holds h
  WHERE h.booking_id = v_booking_id
  LIMIT 1;
END;
$$;

-- 3) Update rpc_claim_payment to require verified email (optional enforcement) and keep ownership checks
CREATE OR REPLACE FUNCTION public.rpc_claim_payment(
  p_booking_id uuid,
  p_payer_name text,
  p_utr text,
  p_screenshot_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email_confirmed_at timestamp with time zone;
BEGIN
  -- Auth required
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Optional: require verified email before deposit
  SELECT email_confirmed_at INTO v_email_confirmed_at FROM auth.users WHERE id = auth.uid();
  IF v_email_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'Email not verified';
  END IF;

  -- Ensure user owns the booking and hold is valid
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.holds h ON h.booking_id = b.id
    WHERE b.id = p_booking_id AND b.user_id = auth.uid() AND b.status = 'held' AND h.expires_at > now()
  ) THEN
    RAISE EXCEPTION 'Invalid or expired hold';
  END IF;

  -- Create payment record
  INSERT INTO public.payments (booking_id, amount, payer_name, utr, screenshot_url, status)
  SELECT b.id, COALESCE(b.amount, 0), p_payer_name, p_utr, p_screenshot_url, 'initiated'
  FROM public.bookings b
  WHERE b.id = p_booking_id;

  -- Update booking status and verification window
  UPDATE public.bookings
  SET status = 'awaiting_verification', deposit_claimed_at = now(), verification_expires_at = now() + interval '30 minutes'
  WHERE id = p_booking_id;

  RETURN true;
END;
$$;