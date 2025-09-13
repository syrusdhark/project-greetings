-- Update the function to allow testadmins@gmail.com as super admin instead of testadmin@gmail.com
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Allow super_admin role only for the specific email
  IF NEW.role = 'super_admin' AND NEW.email != 'testadmins@gmail.com' THEN
    RAISE EXCEPTION 'Only testadmins@gmail.com can have super_admin role';
  END IF;
  
  -- Prevent changing the super_admin account email
  IF OLD IS NOT NULL AND OLD.role = 'super_admin' AND OLD.email = 'testadmins@gmail.com' AND NEW.email != 'testadmins@gmail.com' THEN
    RAISE EXCEPTION 'Cannot change email for super_admin account';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update existing testadmin@gmail.com profile to testadmins@gmail.com if it exists
UPDATE public.user_profiles 
SET email = 'testadmins@gmail.com' 
WHERE email = 'testadmin@gmail.com' AND role = 'super_admin';