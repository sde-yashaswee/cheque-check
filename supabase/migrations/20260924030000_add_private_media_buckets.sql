INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES
  (
    'private-cheque-images',
    'private-cheque-images',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'private-avatars',
    'private-avatars',
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can read their private media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('private-cheque-images', 'private-avatars')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can upload their private media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('private-cheque-images', 'private-avatars')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can update their private media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('private-cheque-images', 'private-avatars')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id IN ('private-cheque-images', 'private-avatars')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete their private media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('private-cheque-images', 'private-avatars')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
