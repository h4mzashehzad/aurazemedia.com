
-- First, drop the conflicting policy that blocks anonymous inserts
DROP POLICY IF EXISTS "Authenticated users can manage inquiries" ON public.contact_inquiries;

-- Create separate policies for authenticated users to manage inquiries
CREATE POLICY "Authenticated users can view all inquiries" 
  ON public.contact_inquiries 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inquiries" 
  ON public.contact_inquiries 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete inquiries" 
  ON public.contact_inquiries 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- The existing "Anyone can submit contact inquiries" policy should now work properly for INSERT
-- The existing "Users can view their own inquiries" policy should work for SELECT by email
