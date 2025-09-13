-- Create admin user profile directly
INSERT INTO public.user_profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  school_id
) VALUES (
  gen_random_uuid(),
  'admin@bluepass.com',
  'Admin',
  'User',
  'admin',
  true,
  NULL
);

-- Note: You'll need to create the actual auth user through the signup process
-- This just creates the profile entry that will be linked when they sign up