-- Create blackout_dates table for schools
CREATE TABLE IF NOT EXISTS public.blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blackout_dates_unique_per_school_date UNIQUE (school_id, date)
);

-- Enable RLS
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;

-- Policies: schools (owners) and passholders
DO $$ BEGIN
  -- Clean up old policies if they exist to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blackout_dates' AND policyname = 'Passholders can view all blackout dates'
  ) THEN
    DROP POLICY "Passholders can view all blackout dates" ON public.blackout_dates;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blackout_dates' AND policyname = 'Schools can view their blackout dates'
  ) THEN
    DROP POLICY "Schools can view their blackout dates" ON public.blackout_dates;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blackout_dates' AND policyname = 'School partners can manage their blackout dates'
  ) THEN
    DROP POLICY "School partners can manage their blackout dates" ON public.blackout_dates;
  END IF;
END $$;

-- Allow passholder to view all
CREATE POLICY "Passholders can view all blackout dates"
ON public.blackout_dates
FOR SELECT
USING (public.get_current_user_role() = 'passholder');

-- Allow schools to view their own blackout dates
CREATE POLICY "Schools can view their blackout dates"
ON public.blackout_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() AND up.school_id = blackout_dates.school_id
  )
);

-- Allow school partners to manage their blackout dates; passholders can manage all
CREATE POLICY "School partners can manage their blackout dates"
ON public.blackout_dates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND (up.role = 'school_partner' OR up.role = 'passholder')
      AND up.school_id = blackout_dates.school_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND (up.role = 'school_partner' OR up.role = 'passholder')
      AND up.school_id = blackout_dates.school_id
  )
);

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blackout_dates_updated_at'
  ) THEN
    CREATE TRIGGER trg_blackout_dates_updated_at
    BEFORE UPDATE ON public.blackout_dates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_blackout_dates_school_date ON public.blackout_dates (school_id, date);
CREATE INDEX IF NOT EXISTS idx_time_slots_school_date ON public.time_slots (school_id, date);

-- Ensure unique sports by case-insensitive name and seed common sports
DO $$ BEGIN
  -- Create a unique index on lower(name) if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'sports' AND indexname = 'uq_sports_name_lower'
  ) THEN
    CREATE UNIQUE INDEX uq_sports_name_lower ON public.sports ((lower(name)));
  END IF;
END $$;

INSERT INTO public.sports (name)
VALUES 
  ('Surfing'),
  ('Stand-up Paddle'),
  ('Kayaking'),
  ('Jet Ski'),
  ('Diving'),
  ('Swimming')
ON CONFLICT ((lower(name))) DO NOTHING;

-- Optional RPC to bulk-generate time slots, respecting blackout dates
CREATE OR REPLACE FUNCTION public.rpc_generate_time_slots(
  p_school_id uuid,
  p_sport_id uuid,
  p_start_date date,
  p_end_date date,
  p_weekdays int[],       -- 0=Sun .. 6=Sat
  p_start_time time,
  p_end_time time,
  p_capacity int
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  d date;
  created_count int := 0;
BEGIN
  -- Authorization: passholder, or school_partner of this school
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND (up.role = 'passholder' OR (up.role = 'school_partner' AND up.school_id = p_school_id))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must be on/after start date';
  END IF;

  FOR d IN SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date LOOP
    IF array_position(p_weekdays, EXTRACT(DOW FROM d)::int) IS NOT NULL THEN
      -- skip if blackout date exists
      IF NOT EXISTS (SELECT 1 FROM public.blackout_dates b WHERE b.school_id = p_school_id AND b.date = d) THEN
        -- avoid duplicates for same (school, sport, date, start_time, end_time)
        IF NOT EXISTS (
          SELECT 1 FROM public.time_slots ts 
          WHERE ts.school_id = p_school_id AND ts.sport_id = p_sport_id
            AND ts.date = d AND ts.start_time = p_start_time AND ts.end_time = p_end_time
        ) THEN
          INSERT INTO public.time_slots (school_id, sport_id, date, start_time, end_time, capacity, seats_left, status)
          VALUES (p_school_id, p_sport_id, d, p_start_time, p_end_time, p_capacity, p_capacity, 'open');
          created_count := created_count + 1;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN created_count;
END;
$$;