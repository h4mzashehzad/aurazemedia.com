-- Add role column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN role TEXT NOT NULL DEFAULT 'full_admin';

-- Create the new admin user with portfolio-only access
SELECT public.create_admin_user('team@aurazemedia.com', 'team@auraze123', 'Portfolio Team');

-- Update the new user's role to portfolio_only
UPDATE public.admin_users 
SET role = 'portfolio_only'
WHERE email = 'team@aurazemedia.com';

-- Update the verify_admin_login function to return the role
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(admin_id UUID, full_name TEXT, email TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.full_name, au.email, au.role
  FROM public.admin_users au
  WHERE au.email = p_email 
    AND au.password_hash = crypt(p_password, au.password_hash)
    AND au.is_active = true;
END;
$$;