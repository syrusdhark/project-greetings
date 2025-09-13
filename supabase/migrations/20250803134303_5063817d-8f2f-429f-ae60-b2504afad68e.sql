-- Update existing user_profiles to merge super_admin and admin roles
UPDATE public.user_profiles 
SET role = 'admin'::user_role 
WHERE role = 'super_admin'::user_role;

-- Drop the super_admin value from the user_role enum and recreate it with only admin and school_partner
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('admin', 'school_partner');

-- Update the user_profiles table to use the new enum
ALTER TABLE public.user_profiles 
ALTER COLUMN role TYPE public.user_role 
USING role::text::public.user_role;

-- Drop the old enum type
DROP TYPE public.user_role_old;

-- Update the default value for role column
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET DEFAULT 'school_partner'::user_role;