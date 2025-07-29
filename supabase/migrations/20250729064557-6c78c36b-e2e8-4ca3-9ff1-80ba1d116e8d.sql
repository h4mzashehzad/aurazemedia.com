-- Remove the new admin user
DELETE FROM public.admin_users WHERE email = 'team@aurazemedia.com';

-- Drop the role column from admin_users table
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS role;

-- Drop the admin_role enum type
DROP TYPE IF EXISTS public.admin_role CASCADE;

-- Drop the role-related functions
DROP FUNCTION IF EXISTS public.has_admin_role(uuid, admin_role);
DROP FUNCTION IF EXISTS public.get_admin_role(uuid);