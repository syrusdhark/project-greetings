-- Create enums for deposit booking and payment statuses if they don't already exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_booking_status') THEN
    CREATE TYPE public.deposit_booking_status AS ENUM (
      'held', 'awaiting_verification', 'paid_deposit', 'consumed', 'expired', 'cancelled_by_user', 'cancelled_by_school', 'refunded_deposit'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_payment_status') THEN
    CREATE TYPE public.deposit_payment_status AS ENUM (
      'initiated', 'succeeded', 'failed', 'refunded', 'cancelled'
    );
  END IF;
END $$;

-- Sports table
CREATE TABLE IF NOT EXISTS public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- School sports mapping
CREATE TABLE IF NOT EXISTS public.school_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  price_per_person NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, sport_id)
);

-- Time slots per school & sport
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  seats_left INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, sport_id, date, start_time, end_time)
);

-- Extend existing bookings table with deposit flow columns (non-breaking)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS sport_id UUID,
  ADD COLUMN IF NOT EXISTS time_slot_id UUID,
  ADD COLUMN IF NOT EXISTS status public.deposit_booking_status,
  ADD COLUMN IF NOT EXISTS amount NUMERIC,
  ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS booking_code TEXT,
  ADD COLUMN IF NOT EXISTS deposit_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meta JSONB;

-- Add FKs where appropriate (nullable to avoid breaking existing data)
DO $$ BEGIN
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure booking_code is unique
DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_code_key UNIQUE (booking_code);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Holds table
CREATE TABLE IF NOT EXISTS public.holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

-- Payments table (deposit entries only)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'upi',
  intent_id TEXT,
  status public.deposit_payment_status NOT NULL DEFAULT 'initiated',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payer_name TEXT,
  utr TEXT,
  screenshot_url TEXT,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform settings for UPI
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_vpa TEXT,
  upi_qr_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner ledger for manual refunds/fees
CREATE TABLE IF NOT EXISTS public.partner_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT now(),
  entry_type TEXT NOT NULL, -- 'debit' or 'credit'
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_sports_updated_at
  BEFORE UPDATE ON public.sports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_school_sports_updated_at
  BEFORE UPDATE ON public.school_sports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policies
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Sports policies
DO $$ BEGIN
  CREATE POLICY "Sports are publicly viewable" ON public.sports FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Passholders can manage sports" ON public.sports FOR ALL USING (get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- School sports policies
DO $$ BEGIN
  CREATE POLICY "School partners can manage their sports" ON public.school_sports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND (up.role = 'school_partner' OR up.role = 'passholder') AND up.school_id = school_sports.school_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Passholders can view all school sports" ON public.school_sports FOR SELECT USING (get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Time slots policies
DO $$ BEGIN
  CREATE POLICY "Time slots are publicly viewable" ON public.time_slots FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "School partners can manage their time slots" ON public.time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND (up.role = 'school_partner' OR up.role = 'passholder') AND up.school_id = time_slots.school_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Holds: only manipulated via SECURITY DEFINER RPCs; deny direct access
DO $$ BEGIN
  CREATE POLICY "No direct holds access" ON public.holds FOR ALL USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payments policies
DO $$ BEGIN
  CREATE POLICY "Passholder can view all payments" ON public.payments FOR SELECT USING (get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = payments.booking_id AND b.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Partner ledger
DO $$ BEGIN
  CREATE POLICY "Passholder can manage partner ledger" ON public.partner_ledger FOR ALL USING (get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Schools can view their ledger" ON public.partner_ledger FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() AND up.school_id = partner_ledger.school_id
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Platform settings (readable by all, manageable by passholder)
DO $$ BEGIN
  CREATE POLICY "Platform settings viewable" ON public.platform_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Passholder can manage platform settings" ON public.platform_settings FOR ALL USING (get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Bookings policies: allow users to view their own bookings
DO $$ BEGIN
  CREATE POLICY "Users can view their own bookings (deposit flow)" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper to generate unique 6-digit booking codes
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    code := lpad((floor(random()*1000000))::INT::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE booking_code = code) INTO exists_code;
    EXIT WHEN NOT exists_code;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- RPC: create hold (initial 2 minutes)
CREATE OR REPLACE FUNCTION public.rpc_create_hold(p_user_id UUID, p_school_id UUID, p_sport_id UUID, p_time_slot_id UUID, p_amount NUMERIC)
RETURNS TABLE(booking_id UUID, booking_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_capacity INT;
  v_seats_left INT;
  v_active_holds INT;
  v_booking_id UUID;
  v_booking_code TEXT;
BEGIN
  -- Optional: if time_slot_id provided, perform capacity checks
  IF p_time_slot_id IS NOT NULL THEN
    SELECT capacity, seats_left INTO v_capacity, v_seats_left FROM public.time_slots WHERE id = p_time_slot_id FOR UPDATE;

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

  v_booking_code := public.generate_booking_code();

  INSERT INTO public.bookings (user_id, school_id, sport_id, time_slot_id, status, amount, booking_code, created_at)
  VALUES (p_user_id, p_school_id, p_sport_id, p_time_slot_id, 'held', p_amount, v_booking_code, now())
  RETURNING id INTO v_booking_id;

  INSERT INTO public.holds (booking_id, expires_at)
  VALUES (v_booking_id, now() + interval '2 minutes');

  RETURN QUERY SELECT v_booking_id, v_booking_code, (SELECT expires_at FROM public.holds WHERE booking_id = v_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: extend hold (e.g., to 10 minutes on deposit page)
CREATE OR REPLACE FUNCTION public.rpc_extend_hold(p_booking_id UUID, p_minutes INT)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_new_expires TIMESTAMPTZ;
BEGIN
  UPDATE public.holds h
  SET expires_at = GREATEST(h.expires_at, now() + make_interval(mins => p_minutes))
  FROM public.bookings b
  WHERE h.booking_id = p_booking_id
    AND b.id = h.booking_id
    AND b.user_id = auth.uid()
    AND b.status = 'held'
  RETURNING h.expires_at INTO v_new_expires;

  IF v_new_expires IS NULL THEN
    RAISE EXCEPTION 'Cannot extend hold';
  END IF;

  RETURN v_new_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: claim payment (move to awaiting_verification and create payment record)
CREATE OR REPLACE FUNCTION public.rpc_claim_payment(p_booking_id UUID, p_payer_name TEXT, p_utr TEXT, p_screenshot_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: confirm deposit (passholder only) and decrement seat atomically if time_slot present
CREATE OR REPLACE FUNCTION public.rpc_confirm_deposit(p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_time_slot UUID;
  v_seats_left INT;
BEGIN
  v_role := public.get_current_user_role();
  IF v_role <> 'passholder' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT time_slot_id INTO v_time_slot FROM public.bookings WHERE id = p_booking_id FOR UPDATE;

  IF v_time_slot IS NOT NULL THEN
    SELECT seats_left INTO v_seats_left FROM public.time_slots WHERE id = v_time_slot FOR UPDATE;
    IF v_seats_left <= 0 THEN
      RAISE EXCEPTION 'No seats left to confirm';
    END IF;
    UPDATE public.time_slots SET seats_left = seats_left - 1 WHERE id = v_time_slot;
  END IF;

  UPDATE public.payments SET status = 'succeeded', is_verified = true, verified_by = auth.uid(), verified_at = now()
  WHERE booking_id = p_booking_id AND status = 'initiated';

  UPDATE public.bookings SET status = 'paid_deposit' WHERE id = p_booking_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: reject deposit (passholder only) and expire booking
CREATE OR REPLACE FUNCTION public.rpc_reject_deposit(p_booking_id UUID, p_note TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_current_user_role();
  IF v_role <> 'passholder' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.payments SET status = 'failed' WHERE booking_id = p_booking_id AND status = 'initiated';
  UPDATE public.bookings SET status = 'expired' WHERE id = p_booking_id;
  DELETE FROM public.holds WHERE booking_id = p_booking_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: expire holds (held -> expired) when holds elapsed
CREATE OR REPLACE FUNCTION public.rpc_expire_holds()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.bookings b
  SET status = 'expired'
  FROM public.holds h
  WHERE b.id = h.booking_id AND b.status = 'held' AND h.expires_at <= now();

  DELETE FROM public.holds WHERE expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: expire awaiting_verification past window
CREATE OR REPLACE FUNCTION public.rpc_expire_verifications()
RETURNS INT AS $$
DECLARE v_count INT; BEGIN
  UPDATE public.bookings
  SET status = 'expired'
  WHERE status = 'awaiting_verification' AND verification_expires_at IS NOT NULL AND verification_expires_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT; RETURN v_count;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment_screenshots', 'payment_screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "Users can upload their own payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment_screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own payment screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment_screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Passholder can view all payment screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment_screenshots' AND public.get_current_user_role() = 'passholder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
