-- Update portfolio admin permissions to remove categories access
-- This migration updates the admin_has_section_access function to restrict portfolio_admin users to only portfolio access

-- Drop and recreate the admin_has_section_access function with updated permissions
DROP FUNCTION IF EXISTS public.admin_has_section_access(uuid, text);

CREATE OR REPLACE FUNCTION public.admin_has_section_access(_admin_id uuid, _section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN role = 'super_admin' THEN true
      WHEN role = 'portfolio_admin' AND _section IN ('portfolio') THEN true
      ELSE false
    END
  FROM public.admin_users
  WHERE id = _admin_id
    AND is_active = true
  LIMIT 1
$$;