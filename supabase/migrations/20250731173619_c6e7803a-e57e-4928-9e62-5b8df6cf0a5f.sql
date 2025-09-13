-- Check if the user exists and create profile if missing
INSERT INTO public.user_profiles (user_id, email, role, first_name, last_name)
SELECT 
  auth.users.id,
  'testadmins@gmail.com',
  'super_admin'::user_role,
  'Test',
  'Admin'
FROM auth.users 
WHERE auth.users.email = 'testadmins@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.users.id
  );