-- Portfolio Database Schema Migration
-- Created for Clinton Arasa Portfolio

-- ============================================================================
-- USERS TABLE (for authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PORTFOLIO ITEMS TABLES
-- ============================================================================

-- Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft')),
  skill_name TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, skill_name)
);

-- Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  responsibilities TEXT[], -- Array of strings
  achievements TEXT[], -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  technologies TEXT[] NOT NULL, -- Array of tech tags
  github_link TEXT,
  live_link TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Education Table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  degree_level TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  grade TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_date DATE NOT NULL,
  expires_at DATE,
  credential_url TEXT,
  badge_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Awards Table
CREATE TABLE IF NOT EXISTS public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  awarded_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hobbies Table
CREATE TABLE IF NOT EXISTS public.hobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- References Table
CREATE TABLE IF NOT EXISTS public.references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Note: newsletter_subscribers table and indexes created in original migration

CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_user_id ON public.experience(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_awards_user_id ON public.awards(user_id);
CREATE INDEX IF NOT EXISTS idx_hobbies_user_id ON public.hobbies(user_id);
CREATE INDEX IF NOT EXISTS idx_references_user_id ON public.references(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Users can read all public portfolios (public profiles)
CREATE POLICY "Users can read their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills: Everyone can read, authenticated users can read/write their own
CREATE POLICY "Anyone can read skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON public.skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Experience: Similar pattern
CREATE POLICY "Anyone can read experience"
  ON public.experience FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own experience"
  ON public.experience FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their experience"
  ON public.experience FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their experience"
  ON public.experience FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Projects: Similar pattern
CREATE POLICY "Anyone can read projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Education: Similar pattern
CREATE POLICY "Anyone can read education"
  ON public.education FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own education"
  ON public.education FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their education"
  ON public.education FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their education"
  ON public.education FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Certifications: Similar pattern
CREATE POLICY "Anyone can read certifications"
  ON public.certifications FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own certifications"
  ON public.certifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their certifications"
  ON public.certifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their certifications"
  ON public.certifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Awards: Similar pattern
CREATE POLICY "Anyone can read awards"
  ON public.awards FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own awards"
  ON public.awards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their awards"
  ON public.awards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their awards"
  ON public.awards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Hobbies: Similar pattern
CREATE POLICY "Anyone can read hobbies"
  ON public.hobbies FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own hobbies"
  ON public.hobbies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their hobbies"
  ON public.hobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their hobbies"
  ON public.hobbies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- References: Only authenticated users (not public)
CREATE POLICY "Users can read their own references"
  ON public.references FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own references"
  ON public.references FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their references"
  ON public.references FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their references"
  ON public.references FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Blog Posts: Public read if published, authenticated write
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own blog posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their blog posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their blog posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Newsletter Subscribers policies created in original migration
