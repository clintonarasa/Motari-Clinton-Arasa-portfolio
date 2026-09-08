INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read portfolio assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Authenticated users can upload portfolio assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets' AND owner_id = auth.uid()::text);

CREATE POLICY "Users can update their portfolio assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio-assets' AND owner_id = auth.uid()::text)
  WITH CHECK (bucket_id = 'portfolio-assets' AND owner_id = auth.uid()::text);

CREATE POLICY "Users can delete their portfolio assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio-assets' AND owner_id = auth.uid()::text);