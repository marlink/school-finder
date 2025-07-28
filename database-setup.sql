-- Manual Database Setup for School Finder
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  surname TEXT,
  role TEXT DEFAULT 'user',
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  school_type TEXT,
  grade_levels TEXT,
  enrollment INTEGER,
  student_teacher_ratio DECIMAL,
  rating DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create school_images table
CREATE TABLE IF NOT EXISTS public.school_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- 5. Create user_searches table
CREATE TABLE IF NOT EXISTS public.user_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create school_analytics table
CREATE TABLE IF NOT EXISTS public.school_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create search_analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_term TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Schools policies (public read access)
CREATE POLICY "Anyone can view schools" ON public.schools
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- School images policies (public read access)
CREATE POLICY "Anyone can view school images" ON public.school_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage school images" ON public.school_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- User searches policies
CREATE POLICY "Users can manage own searches" ON public.user_searches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all searches" ON public.user_searches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Analytics policies (admin only)
CREATE POLICY "Admins can manage school analytics" ON public.school_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage search analytics" ON public.search_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname, role, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'surname',
    'user',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Create admin user profile (replace with your actual user ID)
-- First, you need to get your user ID from auth.users table
-- Then run this insert with your actual user ID:

-- INSERT INTO public.profiles (id, email, name, role, subscription_status)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'design.marceli@gmail.com',
--   'Darth MC',
--   'admin',
--   'premium'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   role = 'admin',
--   name = 'Darth MC',
--   subscription_status = 'premium';

-- To get your user ID, run this query first:
-- SELECT id, email FROM auth.users WHERE email = 'design.marceli@gmail.com';