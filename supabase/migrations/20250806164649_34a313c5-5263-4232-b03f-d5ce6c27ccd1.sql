-- Fix RLS policies for user_profiles to allow users to create their own profiles
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add update policy for users to update their own profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix schools table policies - allow school partners to create schools
DROP POLICY IF EXISTS "School partners can create schools" ON public.schools;
CREATE POLICY "School partners can create schools" 
ON public.schools 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'school_partner'::user_role
  )
);

-- Allow school partners to update their own schools
DROP POLICY IF EXISTS "School partners can update their schools" ON public.schools;
CREATE POLICY "School partners can update their schools" 
ON public.schools 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'school_partner'::user_role OR role = 'passholder'::user_role)
    AND (school_id = schools.id OR role = 'passholder'::user_role)
  )
);