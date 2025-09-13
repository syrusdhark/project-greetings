-- Enable RLS on bookings table if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings table with tenant isolation
CREATE POLICY "School partners can view their own school bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'school_partner' AND school_id = bookings.school_id)
  )
);

CREATE POLICY "Super admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "School partners can update their own school bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'school_partner' AND school_id = bookings.school_id)
  )
);

CREATE POLICY "Super admins can update all bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Enable RLS on schools table if not already enabled
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schools table
CREATE POLICY "School partners can view their own school" 
ON public.schools 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'school_partner' AND school_id = schools.id)
  )
);

CREATE POLICY "Super admins can view all schools" 
ON public.schools 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all schools" 
ON public.schools 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Enable realtime for bookings table
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;