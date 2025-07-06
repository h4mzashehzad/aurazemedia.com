
-- First, let's check what storage policies currently exist and clean them up properly
DROP POLICY IF EXISTS "Anyone can view portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Allow portfolio file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow portfolio file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow portfolio file deletion" ON storage.objects;

-- Also drop any remaining admin-specific policies that might conflict
DROP POLICY IF EXISTS "Admin users can upload portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete portfolio files" ON storage.objects;

-- Create comprehensive storage policies that work with our custom admin auth
CREATE POLICY "Public read access for portfolio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-files');

CREATE POLICY "Allow all portfolio file operations"
ON storage.objects FOR ALL
USING (bucket_id = 'portfolio-files')
WITH CHECK (bucket_id = 'portfolio-files');

-- Ensure the portfolio-files bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-files', 'portfolio-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Also ensure the portfolio_items table policy is completely permissive
DROP POLICY IF EXISTS "Allow portfolio management" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin users can manage portfolio" ON public.portfolio_items;

CREATE POLICY "Unrestricted portfolio access" ON public.portfolio_items
FOR ALL 
USING (true)
WITH CHECK (true);
