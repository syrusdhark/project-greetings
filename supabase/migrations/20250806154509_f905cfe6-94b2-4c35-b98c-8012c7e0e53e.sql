-- Step 1: Add passholder to the user_role enum
ALTER TYPE user_role ADD VALUE 'passholder';

-- Set testadmins@gmail.com to passholder role (will run after commit)
UPDATE public.user_profiles 
SET role = 'passholder'::user_role 
WHERE email = 'testadmins@gmail.com';