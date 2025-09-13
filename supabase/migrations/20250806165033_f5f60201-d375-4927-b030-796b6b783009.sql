-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_uuid uuid;
  user_role user_role := 'school_partner';
BEGIN
  -- Check if user already has a profile (prevent duplicates)
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- If school_name is provided in metadata, create/find school
  IF NEW.raw_user_meta_data->>'school_name' IS NOT NULL AND 
     NEW.raw_user_meta_data->>'school_name' != '' THEN
    
    -- Try to find existing school with the same name
    SELECT id INTO school_uuid 
    FROM public.schools 
    WHERE LOWER(name) = LOWER(NEW.raw_user_meta_data->>'school_name')
    LIMIT 1;
    
    -- If school doesn't exist, create it
    IF school_uuid IS NULL THEN
      INSERT INTO public.schools (
        name,
        display_name,
        email,
        is_active
      ) VALUES (
        NEW.raw_user_meta_data->>'school_name',
        NEW.raw_user_meta_data->>'school_name',
        NEW.email,
        true
      ) RETURNING id INTO school_uuid;
    END IF;
    
    user_role := 'school_partner';
  ELSE
    -- No school provided, regular user
    user_role := 'regular_user';
  END IF;

  -- Create the user profile
  INSERT INTO public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    school_id,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role,
    school_uuid,
    true
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically call the function when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();