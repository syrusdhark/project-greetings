-- Update the user profile with the correct user_id
UPDATE user_profiles 
SET user_id = '7af69df1-0e5a-44d2-9e21-b54be3ebec16' 
WHERE email = 'testadmins@gmail.com' AND user_id IS NULL;