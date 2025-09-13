-- Add required fields for School Partner onboarding
-- 1) Extend schools with profile, media, location, and payout/compliance fields
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS photo_urls text[],
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS primary_beach text,
  ADD COLUMN IF NOT EXISTS upi_vpa text,
  ADD COLUMN IF NOT EXISTS gstin text,
  ADD COLUMN IF NOT EXISTS pan text,
  ADD COLUMN IF NOT EXISTS invoicing_contact_name text,
  ADD COLUMN IF NOT EXISTS invoicing_contact_phone text,
  ADD COLUMN IF NOT EXISTS invoicing_contact_email text;

-- 2) Extend user_profiles with phone number
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- 3) Extend school_sports with languages and eligibility metadata
ALTER TABLE public.school_sports
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS eligibility text;

-- Optional helpful indexes (non-breaking)
CREATE INDEX IF NOT EXISTS idx_schools_city ON public.schools (city);
CREATE INDEX IF NOT EXISTS idx_schools_primary_beach ON public.schools (primary_beach);
