-- BookEasely: Additional storage buckets for avatars and service images
-- Migration: 20260303130000_storage_buckets.sql

-- =============================================================================
-- 1. AVATARS BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view avatars (public bucket)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_select'
  ) THEN
    CREATE POLICY "avatars_select" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Authenticated users can upload their own avatar (folder = user_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_insert'
  ) THEN
    CREATE POLICY "avatars_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid() IS NOT NULL
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Users can update their own avatar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_update'
  ) THEN
    CREATE POLICY "avatars_update" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Users can delete their own avatar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_delete'
  ) THEN
    CREATE POLICY "avatars_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- =============================================================================
-- 2. SERVICE IMAGES BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view service images (public bucket)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'service_images_select'
  ) THEN
    CREATE POLICY "service_images_select" ON storage.objects
      FOR SELECT USING (bucket_id = 'service-images');
  END IF;
END $$;

-- Business owners can upload service images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'service_images_insert'
  ) THEN
    CREATE POLICY "service_images_insert" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'service-images'
        AND EXISTS (SELECT 1 FROM public.businesses WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- Business owners can delete their service images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'service_images_delete'
  ) THEN
    CREATE POLICY "service_images_delete" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'service-images'
        AND EXISTS (SELECT 1 FROM public.businesses WHERE owner_id = auth.uid())
      );
  END IF;
END $$;
