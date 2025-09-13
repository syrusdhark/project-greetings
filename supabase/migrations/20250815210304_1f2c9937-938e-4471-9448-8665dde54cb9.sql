-- Add performance indexes for live bookings
CREATE INDEX IF NOT EXISTS idx_bookings_school_start_time 
ON public.bookings (school_id, booking_date, time_slot);

CREATE INDEX IF NOT EXISTS idx_bookings_updated_at_desc 
ON public.bookings (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id 
ON public.payments (booking_id);

-- Enable realtime for live bookings
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.time_slots REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;