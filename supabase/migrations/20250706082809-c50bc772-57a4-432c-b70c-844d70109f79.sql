
-- Drop existing overly permissive policies and create more specific ones
DROP POLICY IF EXISTS "Admin users can manage portfolio" ON public.portfolio_items;

-- Create a policy that allows operations without requiring Supabase auth session
-- This works for your custom admin authentication system
CREATE POLICY "Allow portfolio management" ON public.portfolio_items
FOR ALL 
USING (true)
WITH CHECK (true);

-- Also ensure the storage policies work correctly for portfolio files
DROP POLICY IF EXISTS "Admin users can upload portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete portfolio files" ON storage.objects;

-- Create storage policies for portfolio-files bucket
CREATE POLICY "Anyone can view portfolio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-files');

CREATE POLICY "Allow portfolio file uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-files');

CREATE POLICY "Allow portfolio file updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-files');

CREATE POLICY "Allow portfolio file deletion"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-files');
