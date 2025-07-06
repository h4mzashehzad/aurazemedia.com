
-- Create a table to store portfolio categories
CREATE TABLE public.portfolio_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_categories
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_categories
CREATE POLICY "Anyone can view active categories" 
  ON public.portfolio_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admin users can manage categories" 
  ON public.portfolio_categories 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Insert default categories
INSERT INTO public.portfolio_categories (name, display_order) VALUES
  ('Real Estate', 1),
  ('Medical', 2),
  ('Clothing', 3),
  ('Food', 4),
  ('Construction', 5);

-- Add trigger to update updated_at column
CREATE TRIGGER update_portfolio_categories_updated_at
  BEFORE UPDATE ON public.portfolio_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
