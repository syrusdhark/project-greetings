-- First, add the 'admin' value to the existing enum
ALTER TYPE public.user_role ADD VALUE 'admin';

-- Update existing super_admin users to admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE role = 'super_admin';

-- Update the get_current_user_role function to handle the new roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid();
$$;