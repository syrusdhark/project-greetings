-- Enable realtime for tables
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.time_slots REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_school_status_time ON public.bookings (school_id, status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_updated_at ON public.bookings (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON public.bookings (status, booking_date);

-- Add RLS policies for real-time reads
CREATE POLICY "School partners can view their bookings for realtime"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'school_partner'
      AND up.school_id = bookings.school_id
  )
);

CREATE POLICY "Passholders can view all bookings for realtime"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND up.role = 'passholder'
  )
);

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