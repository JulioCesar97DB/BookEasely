-- Add photos array column to businesses
ALTER TABLE public.businesses ADD COLUMN photos TEXT[] NOT NULL DEFAULT '{}';

-- Create business-photos storage bucket (public for viewing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('business-photos', 'business-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Anyone can view photos (public bucket)
CREATE POLICY "business_photos_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'business-photos');

-- Only business owner can upload to their business folder
CREATE POLICY "business_photos_insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Only business owner can delete from their business folder
CREATE POLICY "business_photos_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
    )
  );
