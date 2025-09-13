-- Create security definer function to check user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.user_profiles;

-- Recreate policies using security definer function
CREATE POLICY "Super admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'super_admin' OR user_id = auth.uid());

CREATE POLICY "Super admins can manage all profiles" 
ON public.user_profiles 
FOR ALL 
USING (public.get_current_user_role() = 'super_admin');

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());