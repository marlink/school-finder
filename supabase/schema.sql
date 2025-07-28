-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Schools table (simplified without ratings)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT NOT NULL,
  address JSONB, -- { street, city, postal, voivodeship, district }
  contact JSONB, -- { phone, email, website, fax }
  location JSONB, -- { latitude, longitude }
  google_place_id TEXT,
  official_id TEXT, -- Ministry of Education ID (RSPO)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  student_count INTEGER,
  teacher_count INTEGER,
  established_year INTEGER,
  languages JSONB, -- ["polish", "english", "german"]
  specializations JSONB, -- ["mathematics", "sports", "arts"]
  facilities JSONB, -- ["library", "gym", "computer_lab"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- School images
CREATE TABLE IF NOT EXISTS public.school_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'main' CHECK (image_type IN ('main', 'building', 'classroom', 'playground', 'cafeteria', 'logo', 'gallery', 'facility')),
  alt_text TEXT,
  caption TEXT,
  source TEXT DEFAULT 'admin' CHECK (source IN ('admin', 'scraping', 'user_upload')),
  is_verified BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, school_id)
);

-- User search tracking
CREATE TABLE IF NOT EXISTS public.user_searches (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  search_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- School analytics (simplified)
CREATE TABLE IF NOT EXISTS public.school_analytics (
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  date DATE,
  page_views INTEGER DEFAULT 0,
  favorites_added INTEGER DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- seconds
  click_through_rate DECIMAL(3,2) DEFAULT 0,
  PRIMARY KEY (school_id, date)
);

-- Search analytics
CREATE TABLE IF NOT EXISTS public.search_analytics (
  date DATE,
  search_term TEXT,
  search_count INTEGER DEFAULT 0,
  avg_results DECIMAL(5,1) DEFAULT 0,
  PRIMARY KEY (date, search_term)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_searches ENABLE RLS;
ALTER TABLE public.school_analytics ENABLE RLS;
ALTER TABLE public.search_analytics ENABLE RLS;

-- RLS Policies
-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Schools: Public read access
CREATE POLICY "Schools are publicly readable" ON public.schools
  FOR SELECT USING (true);

-- School images: Public read access
CREATE POLICY "School images are publicly readable" ON public.school_images
  FOR SELECT USING (true);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- User searches: Users can view and update their own search data
CREATE POLICY "Users can view own search data" ON public.user_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own search data" ON public.user_searches
  FOR ALL USING (auth.uid() = user_id);

-- Analytics: Admin only access
CREATE POLICY "Only admins can access school analytics" ON public.school_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can access search analytics" ON public.search_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_type ON public.schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_status ON public.schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_location ON public.schools USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_school_images_school_id ON public.school_images(school_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_school_id ON public.favorites(school_id);
CREATE INDEX IF NOT EXISTS idx_school_analytics_date ON public.school_analytics(date);
CREATE INDEX IF NOT EXISTS idx_search_analytics_search_term ON public.search_analytics(search_term);
