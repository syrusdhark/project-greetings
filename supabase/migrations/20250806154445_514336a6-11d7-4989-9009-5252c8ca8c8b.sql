-- Add passholder to the user_role enum
ALTER TYPE user_role ADD VALUE 'passholder';

-- Update existing super_admin and admin users to passholder role
UPDATE public.user_profiles 
SET role = 'passholder'::user_role 
WHERE role IN ('super_admin'::user_role, 'admin'::user_role);

-- Update the prevent_unauthorized function for passholder role
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Allow passholder role only for the specific email
  IF NEW.role = 'passholder' AND NEW.email != 'testadmins@gmail.com' THEN
    RAISE EXCEPTION 'Only testadmins@gmail.com can have passholder role';
  END IF;
  
  -- Prevent changing the passholder account email
  IF OLD IS NOT NULL AND OLD.role = 'passholder' AND OLD.email = 'testadmins@gmail.com' AND NEW.email != 'testadmins@gmail.com' THEN
    RAISE EXCEPTION 'Cannot change email for passholder account';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update RLS policies to include passholder with all admin/super_admin permissions
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;
CREATE POLICY "Passholders can view all audit logs" 
ON audit_logs FOR SELECT 
TO authenticated 
USING (get_current_user_role() = 'passholder');

DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all user profiles" ON user_profiles;
CREATE POLICY "Passholders can view all user profiles" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (get_current_user_role() = 'passholder');

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Passholders can manage all profiles" 
ON user_profiles FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'passholder');

DROP POLICY IF EXISTS "Super admins can manage schools" ON schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;
CREATE POLICY "Passholders can manage schools" 
ON schools FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'passholder');

-- Update bookings policies to include passholder
DROP POLICY IF EXISTS "School partners can view their school bookings" ON bookings;
CREATE POLICY "School partners and passholders can view bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (EXISTS ( 
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND (user_profiles.role = 'passholder'::user_role OR user_profiles.school_id = bookings.school_id)
));

DROP POLICY IF EXISTS "School partners can update their school bookings" ON bookings;
CREATE POLICY "School partners and passholders can update bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (EXISTS ( 
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND (user_profiles.role = 'passholder'::user_role OR user_profiles.school_id = bookings.school_id)
));

DROP POLICY IF EXISTS "School partners can create bookings" ON bookings;
CREATE POLICY "School partners and passholders can create bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS ( 
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.user_id = auth.uid() 
  AND (user_profiles.role = 'passholder'::user_role OR user_profiles.school_id = bookings.school_id)
));

-- Allow passholders to manage testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Super admins can manage testimonials" ON testimonials;
CREATE POLICY "Passholders can manage testimonials" 
ON testimonials FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'passholder');

-- Allow passholders to manage water sports providers
DROP POLICY IF EXISTS "Admins can manage water sports providers" ON water_sports_providers;
DROP POLICY IF EXISTS "Super admins can manage water sports providers" ON water_sports_providers;
CREATE POLICY "Passholders can manage water sports providers" 
ON water_sports_providers FOR ALL 
TO authenticated 
USING (get_current_user_role() = 'passholder');