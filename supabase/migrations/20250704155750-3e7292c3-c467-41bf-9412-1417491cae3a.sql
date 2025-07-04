
-- Create enum types for better data integrity
CREATE TYPE public.project_category AS ENUM ('Real Estate', 'Medical', 'Clothing', 'Food', 'Construction');
CREATE TYPE public.aspect_ratio AS ENUM ('square', 'wide', 'tall');

-- Portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category project_category NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  aspect_ratio aspect_ratio NOT NULL DEFAULT 'square',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT NOT NULL,
  experience TEXT NOT NULL,
  bio TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pricing packages table
CREATE TABLE public.pricing_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  project_type project_category,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Website settings table for global configuration
CREATE TABLE public.website_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (portfolio, team, pricing, settings)
CREATE POLICY "Anyone can view portfolio items" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view pricing packages" ON public.pricing_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view website settings" ON public.website_settings FOR SELECT USING (true);

-- Contact inquiries - anyone can insert, only authenticated users can view their own
CREATE POLICY "Anyone can submit contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own inquiries" ON public.contact_inquiries FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Admin policies - only authenticated users can modify content
CREATE POLICY "Authenticated users can manage portfolio" ON public.portfolio_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage team" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage pricing" ON public.pricing_packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage settings" ON public.website_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage inquiries" ON public.contact_inquiries FOR ALL USING (auth.role() = 'authenticated');

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON public.portfolio_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_packages_updated_at BEFORE UPDATE ON public.pricing_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_website_settings_updated_at BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial website settings
INSERT INTO public.website_settings (key, value) VALUES
('site_config', '{
  "name": "Tasveeri Yaadein",
  "tagline": "Capturing Moments, Creating Memories",
  "contact": {
    "phone": "+92 300 1234567",
    "email": "info@tasveeriyaadein.com",
    "address": "Studio 12, Creative Hub, Gulberg III, Lahore, Pakistan"
  }
}'::jsonb);

-- Insert sample portfolio items
INSERT INTO public.portfolio_items (title, category, image_url, caption, aspect_ratio, tags, is_featured, display_order) VALUES
('Modern Villa Photography', 'Real Estate', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=600&fit=crop', 'Our Own Client', 'square', '{"Real Estate"}', true, 1),
('Medical Facility Shoot', 'Medical', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop', 'Our Own Client', 'square', '{"Medical"}', false, 2),
('Restaurant Photography', 'Food', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop', 'Worked with Creative Agency for Restaurant XYZ', 'wide', '{"Food"}', false, 3),
('Fashion Brand Shoot', 'Clothing', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop', 'Worked with Fashion House for Brand ABC', 'tall', '{"Clothing"}', false, 4),
('Construction Project', 'Construction', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop', 'Our Own Client', 'wide', '{"Construction"}', false, 5),
('Luxury Home Interior', 'Real Estate', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop', 'Worked with Property Plus for Luxury Homes', 'tall', '{"Real Estate"}', false, 6),
('Gourmet Cuisine', 'Food', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop', 'Our Own Client', 'square', '{"Food"}', false, 7),
('Fashion Week Collection', 'Clothing', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop', 'Worked with Style Studio for Fashion Week', 'tall', '{"Clothing"}', false, 8);

-- Insert sample team members
INSERT INTO public.team_members (name, role, image_url, experience, display_order) VALUES
('Ahmed Khan', 'Lead Photographer', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop', '8+ years', 1),
('Sara Ali', 'Creative Director', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop', '6+ years', 2),
('Hassan Sheikh', 'Video Editor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', '5+ years', 3),
('Fatima Malik', 'Photographer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', '4+ years', 4);

-- Insert sample pricing packages
INSERT INTO public.pricing_packages (name, price, features, is_popular, display_order) VALUES
('Basic Package', 'Rs. 25,000', '{"2-3 hours photo session", "50+ edited photos", "High-resolution images", "Basic retouching", "Online gallery"}', false, 1),
('Professional Package', 'Rs. 50,000', '{"Full day photo session", "150+ edited photos", "High-resolution images", "Advanced retouching", "Online gallery", "Print-ready files", "2 revision rounds"}', true, 2),
('Premium Package', 'Rs. 85,000', '{"2-day photo session", "300+ edited photos", "4K video highlights", "Professional retouching", "Online gallery", "Print-ready files", "Unlimited revisions", "Same-day preview"}', false, 3);
