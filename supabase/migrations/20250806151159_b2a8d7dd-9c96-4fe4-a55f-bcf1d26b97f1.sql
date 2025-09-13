-- Ensure only testadmin@gmail.com can be super_admin
-- First, update the existing admin account to super_admin
UPDATE public.user_profiles 
SET role = 'super_admin' 
WHERE email = 'testadmin@gmail.com';

-- Create a trigger to prevent unauthorized super_admin accounts
CREATE OR REPLACE FUNCTION prevent_unauthorized_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow super_admin role only for the specific email
  IF NEW.role = 'super_admin' AND NEW.email != 'testadmin@gmail.com' THEN
    RAISE EXCEPTION 'Only testadmin@gmail.com can have super_admin role';
  END IF;
  
  -- Prevent changing the super_admin account email
  IF OLD IS NOT NULL AND OLD.role = 'super_admin' AND OLD.email = 'testadmin@gmail.com' AND NEW.email != 'testadmin@gmail.com' THEN
    RAISE EXCEPTION 'Cannot change email for super_admin account';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to both INSERT and UPDATE operations
DROP TRIGGER IF EXISTS enforce_super_admin_restriction ON public.user_profiles;
CREATE TRIGGER enforce_super_admin_restriction
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_super_admin();