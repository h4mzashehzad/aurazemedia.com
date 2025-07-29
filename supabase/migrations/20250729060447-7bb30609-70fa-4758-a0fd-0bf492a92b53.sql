-- Add visibility controls for pricing packages
ALTER TABLE public.pricing_packages 
ADD COLUMN is_visible BOOLEAN DEFAULT true;

-- Add website setting to control entire pricing section visibility
INSERT INTO public.website_settings (key, value) 
VALUES ('pricing_section_visible', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;