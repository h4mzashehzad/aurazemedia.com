-- Create enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'portfolio_admin');

-- Add role column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN role admin_role DEFAULT 'portfolio_admin';

-- Update existing admin users to be super_admin (if any exist)
UPDATE public.admin_users 
SET role = 'super_admin' 
WHERE role IS NULL;

-- Create function to check admin roles
CREATE OR REPLACE FUNCTION public.has_admin_role(_admin_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = _admin_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_admin_id uuid)
RETURNS admin_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.admin_users
  WHERE id = _admin_id
    AND is_active = true
  LIMIT 1
$$;

-- Create the new portfolio admin user
INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES (
  'team@aurazemedia.com',
  crypt('team@aurazemedia', gen_salt('bf')),
  'Portfolio Team',
  'portfolio_admin'
);