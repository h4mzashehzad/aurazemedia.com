-- Remove the enum constraint and change portfolio_items.category to text
-- First, change the column type to text
ALTER TABLE public.portfolio_items 
ALTER COLUMN category TYPE TEXT;

-- Drop the old enum if it's no longer needed
DROP TYPE IF EXISTS project_category;

-- Update contact_inquiries project_type column to text as well if it uses the same enum
ALTER TABLE public.contact_inquiries 
ALTER COLUMN project_type TYPE TEXT;