-- Add role-based access control for admin users
-- This migration creates a role system and adds a portfolio-only admin user

-- Create enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'portfolio_admin');

-- Add role column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN role admin_role DEFAULT 'super_admin';

-- Update existing admin users to be super_admin
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

-- Drop existing verify_admin_login function first
DROP FUNCTION IF EXISTS public.verify_admin_login(text, text);

-- Create the verify_admin_login function with role support
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(admin_id UUID, full_name TEXT, email TEXT, role admin_role)
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

-- Create the new portfolio admin user with specified credentials
INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES (
  'team@aurazemedia.com',
  crypt('Team@Auraze1Media', gen_salt('bf')),
  'Portfolio Team',
  'portfolio_admin'
);

-- Create function to check if admin has access to specific sections
CREATE OR REPLACE FUNCTION public.admin_has_section_access(_admin_id uuid, _section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN role = 'super_admin' THEN true
      WHEN role = 'portfolio_admin' AND _section IN ('portfolio', 'categories') THEN true
      ELSE false
    END
  FROM public.admin_users
  WHERE id = _admin_id
    AND is_active = true
  LIMIT 1
$$;