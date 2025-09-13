-- Fix the get_booking_metrics function to use correct column name
CREATE OR REPLACE FUNCTION public.get_booking_metrics(p_start_date date DEFAULT CURRENT_DATE, p_end_date date DEFAULT CURRENT_DATE, p_school_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(bookings_today bigint, bookings_7d bigint, bookings_30d bigint, revenue_today numeric, revenue_7d numeric, revenue_30d numeric, cancellations_today bigint, refunds_today bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
    COUNT(*) FILTER (WHERE b.booking_date = p_start_date AND b.status::text LIKE 'cancelled_%') as cancellations_today,
    -- Refunds today
    COUNT(*) FILTER (WHERE b.booking_date = p_start_date AND b.status::text LIKE 'refunded_%') as refunds_today
  FROM public.bookings b
  LEFT JOIN public.payments p ON p.booking_id = b.id
  WHERE (p_school_id IS NULL OR b.school_id = p_school_id)
    AND b.booking_date >= p_start_date - interval '29 days';
END;
$function$