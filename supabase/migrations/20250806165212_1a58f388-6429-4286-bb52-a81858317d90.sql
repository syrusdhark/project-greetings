-- Delete all user profiles except testadmins@gmail.com
DELETE FROM public.user_profiles 
WHERE email != 'testadmins@gmail.com';