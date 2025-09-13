-- Fix RLS policies for better data access

-- Add RLS policies for bookings table
CREATE POLICY "School partners can view their school bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'super_admin' OR school_id = bookings.school_id)
    )
  );

CREATE POLICY "School partners can update their school bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'super_admin' OR school_id = bookings.school_id)
    )
  );

-- Add RLS policies for schools table  
CREATE POLICY "All authenticated users can view schools" ON public.schools
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Improve user_profiles policies for better admin access
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
  FOR SELECT USING (
    get_current_user_role() = 'super_admin' OR 
    get_current_user_role() = 'admin'
  );