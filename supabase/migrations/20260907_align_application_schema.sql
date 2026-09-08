-- Align database fields used by the profile and blog admin screens.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS read_time TEXT;

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read their own references" ON public.references;
CREATE POLICY "Anyone can read references"
  ON public.references FOR SELECT
  USING (true);

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'experience', 'projects', 'education', 'certifications',
    'awards', 'hobbies', 'references', 'blog_posts'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can update their %s" ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE POLICY "Users can update their %s" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      table_name, table_name
    );
  END LOOP;
END $$;