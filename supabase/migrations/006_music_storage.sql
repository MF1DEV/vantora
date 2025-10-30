-- Create storage bucket for background music
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for music bucket
CREATE POLICY "Users can upload their own music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own music"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'music' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own music"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'music' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Music files are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'music');
