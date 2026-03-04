-- ============================================
-- Phone Auth & Notification Infrastructure Migration
-- ============================================
-- Changes:
-- 1. profiles.email → nullable (phone is now primary)
-- 2. profiles.phone → UNIQUE constraint
-- 3. worker_invitations: email → phone
-- 4. New tables: push_tokens, notification_preferences
-- 5. bookings.reminder_sent_at column
-- 6. Enable pg_net extension (async HTTP from triggers)
-- 7. Update handle_new_user() for phone auth
-- 8. Update handle_worker_invitation_on_signup() for phone lookup
-- 9. Update RLS policy for worker_invitations (phone instead of email)

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================
-- PROFILES: email nullable, phone unique
-- ============================================
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email DROP DEFAULT;

-- Remove old unique constraint on email (if exists) and make it non-unique nullable
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Phone must be unique and not empty for authenticated users
ALTER TABLE public.profiles ALTER COLUMN phone SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
-- Remove the default empty string since phone is now required
ALTER TABLE public.profiles ALTER COLUMN phone DROP DEFAULT;

-- ============================================
-- WORKER INVITATIONS: email → phone
-- ============================================
-- Drop old unique constraint
ALTER TABLE public.worker_invitations DROP CONSTRAINT IF EXISTS worker_invitations_email_business_id_key;

-- Rename column
ALTER TABLE public.worker_invitations RENAME COLUMN email TO phone;

-- Add new unique constraint
ALTER TABLE public.worker_invitations ADD CONSTRAINT worker_invitations_phone_business_id_key UNIQUE (phone, business_id);

-- Update index
DROP INDEX IF EXISTS idx_worker_invitations_email;
CREATE INDEX idx_worker_invitations_phone ON public.worker_invitations(phone);

-- ============================================
-- PUSH TOKENS
-- ============================================
CREATE TABLE public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expo_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ios' CHECK (platform IN ('ios', 'android')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, expo_token)
);

CREATE INDEX idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON public.push_tokens(user_id, is_active) WHERE is_active = true;

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BOOKINGS: reminder tracking
-- ============================================
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Push tokens: users manage their own
CREATE POLICY "push_tokens_select_own" ON public.push_tokens
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "push_tokens_insert_own" ON public.push_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "push_tokens_update_own" ON public.push_tokens
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "push_tokens_delete_own" ON public.push_tokens
  FOR DELETE USING (user_id = auth.uid());

-- Allow service role / triggers to read push tokens for sending notifications
CREATE POLICY "push_tokens_service_select" ON public.push_tokens
  FOR SELECT USING (true);

-- Notification preferences: users manage their own
CREATE POLICY "notification_preferences_select_own" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- UPDATE: handle_new_user() for phone auth
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,  -- Will be NULL for phone-only users
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, COALESCE(NEW.raw_user_meta_data->>'phone', '')),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );

  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE: handle_worker_invitation_on_signup() for phone lookup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_worker_invitation_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
BEGIN
  -- Match pending invitations by phone number
  FOR inv IN
    SELECT * FROM public.worker_invitations
    WHERE phone = NEW.phone AND status = 'pending'
  LOOP
    INSERT INTO public.workers (user_id, business_id, display_name, bio, specialties, is_active)
    VALUES (NEW.id, inv.business_id, inv.display_name, inv.bio, inv.specialties, true)
    ON CONFLICT (user_id, business_id) DO NOTHING;

    UPDATE public.worker_invitations SET status = 'accepted', accepted_at = now() WHERE id = inv.id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE: RLS policy for worker_invitations (phone instead of email)
-- ============================================
DROP POLICY IF EXISTS "worker_invitations_select_self" ON public.worker_invitations;
CREATE POLICY "worker_invitations_select_self" ON public.worker_invitations
  FOR SELECT USING (
    phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid())
  );
