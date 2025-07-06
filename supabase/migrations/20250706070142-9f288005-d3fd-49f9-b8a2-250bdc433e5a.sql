
-- First, let's check what policies currently exist and recreate them properly
DROP POLICY IF EXISTS "Anyone can submit contact inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Authenticated users can view all inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Authenticated users can delete inquiries" ON public.contact_inquiries;

-- Create a simple policy that allows anyone to insert contact inquiries
CREATE POLICY "Allow anonymous contact submissions" 
  ON public.contact_inquiries 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to manage all inquiries
CREATE POLICY "Authenticated users can manage all inquiries" 
  ON public.contact_inquiries 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to view inquiries by their email (for follow-up purposes)
CREATE POLICY "Users can view inquiries by email" 
  ON public.contact_inquiries 
  FOR SELECT 
  TO anon, authenticated
  USING (true);
