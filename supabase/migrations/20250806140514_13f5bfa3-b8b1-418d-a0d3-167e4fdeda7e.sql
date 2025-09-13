-- Add policy for admins to select their own profiles
CREATE POLICY "Admins can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add policy for school partners to view their own profiles  
CREATE POLICY "School partners can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id AND role = 'school_partner');

-- Add policy for regular users to view their own profiles
CREATE POLICY "Regular users can view their own profile"
ON public.user_profiles
FOR SELECT  
USING (auth.uid() = user_id AND role = 'regular_user');