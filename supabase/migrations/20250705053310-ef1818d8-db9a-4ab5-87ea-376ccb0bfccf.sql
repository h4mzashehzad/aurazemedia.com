
-- Create admin users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view their own data
CREATE POLICY "Admin users can view their own data" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

-- Create policy for admin users to update their own data
CREATE POLICY "Admin users can update their own data" 
  ON public.admin_users 
  FOR UPDATE 
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

-- Create a function to hash passwords (simplified for demo)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  INSERT INTO public.admin_users (email, password_hash, full_name)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name)
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$;

-- Create a function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(admin_id UUID, full_name TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.full_name, au.email
  FROM public.admin_users au
  WHERE au.email = p_email 
    AND au.password_hash = crypt(p_password, au.password_hash)
    AND au.is_active = true;
END;
$$;

-- Insert a default admin user (password: admin123)
SELECT public.create_admin_user('admin@tasveeriyaadein.com', 'admin123', 'Site Administrator');

-- Add trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
