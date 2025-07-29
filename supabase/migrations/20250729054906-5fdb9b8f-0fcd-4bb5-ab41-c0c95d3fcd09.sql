-- Update both columns that use project_category enum to text
ALTER TABLE public.portfolio_items 
ALTER COLUMN category TYPE TEXT;

ALTER TABLE public.contact_inquiries 
ALTER COLUMN project_type TYPE TEXT;

-- Now drop the enum safely
DROP TYPE IF EXISTS project_category CASCADE;