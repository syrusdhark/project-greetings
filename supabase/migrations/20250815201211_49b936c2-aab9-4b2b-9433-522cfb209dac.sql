-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_school_status_time ON public.bookings (school_id, status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_updated_at ON public.bookings (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON public.bookings (status, booking_date);

-- Add function to get live booking metrics
CREATE OR REPLACE FUNCTION public.get_booking_metrics(
  p_start_date date DEFAULT CURRENT_DATE,
  p_end_date date DEFAULT CURRENT_DATE,
  p_school_id uuid DEFAULT NULL
)
RETURNS TABLE(
  bookings_today bigint,
  bookings_7d bigint,
  bookings_30d bigint,
  revenue_today numeric,
  revenue_7d numeric,
  revenue_30d numeric,
  cancellations_today bigint,
  refunds_today bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Bookings today
    COUNT(*) FILTER (WHERE b.booking_date = p_start_date AND b.status = 'paid_deposit') as bookings_today,
    -- Bookings 7 days
    COUNT(*) FILTER (WHERE b.booking_date >= p_start_date - interval '6 days' AND b.status = 'paid_deposit') as bookings_7d,
    -- Bookings 30 days
    COUNT(*) FILTER (WHERE b.booking_date >= p_start_date - interval '29 days' AND b.status = 'paid_deposit') as bookings_30d,
    -- Revenue today
    COALESCE(SUM(p.amount) FILTER (WHERE b.booking_date = p_start_date AND p.status = 'succeeded'), 0) as revenue_today,
    -- Revenue 7 days
    COALESCE(SUM(p.amount) FILTER (WHERE b.booking_date >= p_start_date - interval '6 days' AND p.status = 'succeeded'), 0) as revenue_7d,
    -- Revenue 30 days
    COALESCE(SUM(p.amount) FILTER (WHERE b.booking_date >= p_start_date - interval '29 days' AND p.status = 'succeeded'), 0) as revenue_30d,
    -- Cancellations today
    COUNT(*) FILTER (WHERE b.booking_date = p_start_date AND b.status LIKE 'cancelled_%') as cancellations_today,
    -- Refunds today
    COUNT(*) FILTER (WHERE b.booking_date = p_start_date AND b.status LIKE 'refunded_%') as refunds_today
  FROM public.bookings b
  LEFT JOIN public.payments p ON p.booking_id = b.id
  WHERE (p_school_id IS NULL OR b.school_id = p_school_id)
    AND b.booking_date >= p_start_date - interval '29 days';
END;
$$;

-- Function to get live bookings with details
CREATE OR REPLACE FUNCTION public.get_live_bookings(
  p_school_id uuid DEFAULT NULL,
  p_date_filter text DEFAULT 'today'
)
RETURNS TABLE(
  id uuid,
  booking_code text,
  customer_name text,
  customer_email text,
  customer_phone text,
  activity_booked text,
  booking_date date,
  time_slot text,
  participants integer,
  amount numeric,
  status text,
  payment_status text,
  school_name text,
  sport_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  start_date date;
  end_date date;
BEGIN
  -- Set date range based on filter
  CASE p_date_filter
    WHEN 'today' THEN
      start_date := CURRENT_DATE;
      end_date := CURRENT_DATE;
    WHEN 'upcoming' THEN
      start_date := CURRENT_DATE;
      end_date := CURRENT_DATE + interval '30 days';
    ELSE
      start_date := CURRENT_DATE - interval '90 days';
      end_date := CURRENT_DATE + interval '30 days';
  END CASE;

  RETURN QUERY
  SELECT 
    b.id,
    b.booking_code,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.activity_booked,
    b.booking_date,
    b.time_slot,
    b.participants,
    b.amount,
    b.status::text,
    COALESCE(p.status::text, 'unpaid') as payment_status,
    s.display_name as school_name,
    sp.name as sport_name,
    b.created_at,
    b.updated_at
  FROM public.bookings b
  LEFT JOIN public.payments p ON p.booking_id = b.id
  LEFT JOIN public.schools s ON s.id = b.school_id
  LEFT JOIN public.sports sp ON sp.id = b.sport_id
  WHERE (p_school_id IS NULL OR b.school_id = p_school_id)
    AND b.booking_date >= start_date
    AND b.booking_date <= end_date
  ORDER BY b.booking_date ASC, b.created_at DESC;
END;
$$;