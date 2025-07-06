
-- Update the admin user credentials
UPDATE public.admin_users 
SET 
  email = 'admin@aurazemedia.com',
  password_hash = crypt('auraze@media123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@tasveeriyaadein.com';
