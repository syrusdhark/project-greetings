-- First, let's create a function to handle test user creation
CREATE OR REPLACE FUNCTION create_test_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT DEFAULT 'school_partner',
  user_school_id UUID DEFAULT NULL,
  first_name TEXT DEFAULT NULL,
  last_name TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Note: This function provides the structure, but actual user creation
  -- must be done through Supabase Auth signup process
  
  RETURN 'Use the signup process at /admin/signin to create users with these credentials, then update their profiles manually.';
END;
$$ LANGUAGE plpgsql;

-- Let's also create a helper to update user profiles after signup
CREATE OR REPLACE FUNCTION update_user_profile_role(
  user_email TEXT,
  new_role TEXT,
  new_school_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  UPDATE public.user_profiles 
  SET 
    role = new_role::user_role,
    school_id = new_school_id
  WHERE email = user_email;
  
  IF FOUND THEN
    RETURN 'Profile updated successfully';
  ELSE
    RETURN 'User profile not found';
  END IF;
END;
$$ LANGUAGE plpgsql;