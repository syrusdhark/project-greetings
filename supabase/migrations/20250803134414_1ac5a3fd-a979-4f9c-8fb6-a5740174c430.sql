-- Update existing super_admin users to admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE role = 'super_admin';

-- Add RLS policy for audit logs - only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;