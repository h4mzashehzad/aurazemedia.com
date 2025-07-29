-- Add website_url column to portfolio_items table
ALTER TABLE public.portfolio_items 
ADD COLUMN website_url TEXT;