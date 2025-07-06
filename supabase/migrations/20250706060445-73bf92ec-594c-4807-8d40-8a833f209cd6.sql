
-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-files', 'portfolio-files', true);

-- Create storage policy to allow anyone to view files
CREATE POLICY "Anyone can view portfolio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-files');

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Admin users can upload portfolio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-files' AND auth.role() = 'authenticated');

-- Create storage policy to allow authenticated users to update files
CREATE POLICY "Admin users can update portfolio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-files' AND auth.role() = 'authenticated');

-- Create storage policy to allow authenticated users to delete files
CREATE POLICY "Admin users can delete portfolio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-files' AND auth.role() = 'authenticated');
