-- Fix security vulnerability: Restrict platform_settings access to administrators only
-- Drop the public read policy that allows anyone to view payment configuration
DROP POLICY "Platform settings viewable" ON public.platform_settings;

-- Create a secure policy that only allows passholders to view platform settings
CREATE POLICY "Passholders can view platform settings" 
ON public.platform_settings 
FOR SELECT 
USING (get_current_user_role() = 'passholder'::text);