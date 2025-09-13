-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('super_admin', 'school_partner');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('new', 'viewed', 'actioned');

-- Create enum for payment status  
CREATE TYPE public.payment_status AS ENUM ('paid', 'unpaid', 'pending');

-- Create schools table (tenants)
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  max_capacity_per_slot INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table for admin users
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'school_partner',
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enhanced bookings table
DROP TABLE IF EXISTS public.bookings;
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  activity_booked TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- '06:00-07:00', '07:00-08:00', etc.
  participants INTEGER NOT NULL DEFAULT 1,
  payment_status payment_status DEFAULT 'unpaid',
  booking_status booking_status DEFAULT 'new',
  notes TEXT,
  total_price NUMERIC,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  actioned_at TIMESTAMP WITH TIME ZONE
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  school_id UUID REFERENCES public.schools(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools
CREATE POLICY "Super admins can view all schools" ON public.schools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "School partners can view their own school" ON public.schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'school_partner'
    )
  );

CREATE POLICY "Super admins can modify schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'super_admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Super admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "School partners can view their school bookings" ON public.bookings
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'school_partner'
    )
  );

CREATE POLICY "Super admins can modify all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "School partners can modify their school bookings" ON public.bookings
  FOR UPDATE USING (
    school_id IN (
      SELECT school_id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'school_partner'
    )
  );

-- Public booking creation (for customer-facing forms)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "School partners can view their school audit logs" ON public.audit_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'school_partner'
    )
  );

-- Functions for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_entry(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_user_profile RECORD;
BEGIN
  -- Get current user profile
  SELECT * INTO current_user_profile 
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
  
  INSERT INTO public.audit_logs (
    user_id,
    school_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    current_user_profile.school_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for booking status changes
CREATE OR REPLACE FUNCTION public.handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.booking_status != NEW.booking_status THEN
    IF NEW.booking_status = 'viewed' THEN
      NEW.viewed_at = now();
    ELSIF NEW.booking_status = 'actioned' THEN
      NEW.actioned_at = now();
    END IF;
    
    -- Log the status change
    PERFORM public.log_audit_entry(
      'status_change',
      'booking',
      NEW.id,
      to_jsonb(OLD.booking_status),
      to_jsonb(NEW.booking_status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change_trigger
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_status_change();

-- Enable realtime for bookings
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Insert demo school and admin user data
INSERT INTO public.schools (id, name, display_name, email, phone, max_capacity_per_slot) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'SUP Marina', 'SUP Marina School', 'admin@supmarina.com', '+91-9876543210', 12),
  ('550e8400-e29b-41d4-a716-446655440002', 'Blue Wave Academy', 'Blue Wave Academy', 'contact@bluewave.com', '+91-9876543211', 8);

-- Note: User profiles will be created via the application when users sign up