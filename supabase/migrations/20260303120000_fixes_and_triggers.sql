-- BookEasely: Database fixes - constraints, indexes, and notification triggers
-- Migration: 20260303120000_fixes_and_triggers.sql

-- =============================================================================
-- 1. CONSTRAINTS
-- =============================================================================

-- Ensure booking end_time is always after start_time
ALTER TABLE public.bookings
  ADD CONSTRAINT chk_booking_time CHECK (end_time > start_time);

-- Prevent overlapping bookings for the same worker on the same date
-- Requires btree_gist extension for EXCLUDE constraint with multiple operators
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    worker_id WITH =,
    date WITH =,
    tsrange(
      ('2000-01-01'::date + start_time)::timestamp,
      ('2000-01-01'::date + end_time)::timestamp,
      '[)'
    ) WITH &&
  ) WHERE (status IN ('pending', 'confirmed'));

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

-- Optimize booking queries filtered by status and date
CREATE INDEX IF NOT EXISTS idx_bookings_status_date
  ON public.bookings(status, date);

-- Optimize worker invitation queries by status
CREATE INDEX IF NOT EXISTS idx_worker_invitations_status
  ON public.worker_invitations(status);

-- Optimize active services lookup per business
CREATE INDEX IF NOT EXISTS idx_services_business_active
  ON public.services(business_id, is_active)
  WHERE is_active = true;

-- Optimize notification queries for unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read)
  WHERE is_read = false;

-- =============================================================================
-- 3. NOTIFICATION TRIGGERS
-- =============================================================================

-- Function: create notifications when bookings are created or status changes
CREATE OR REPLACE FUNCTION public.handle_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_business_owner_id UUID;
  v_service_name TEXT;
  v_client_name TEXT;
BEGIN
  -- Look up related data
  SELECT owner_id INTO v_business_owner_id
    FROM public.businesses WHERE id = NEW.business_id;
  SELECT name INTO v_service_name
    FROM public.services WHERE id = NEW.service_id;
  SELECT full_name INTO v_client_name
    FROM public.profiles WHERE id = NEW.client_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify business owner of new booking
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_business_owner_id,
      'booking_created',
      'New Booking',
      coalesce(v_client_name, 'A client') || ' booked ' || coalesce(v_service_name, 'a service') || ' for ' || NEW.date::text,
      jsonb_build_object('booking_id', NEW.id, 'business_id', NEW.business_id)
    );

    -- Notify client of booking status
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.client_id,
      CASE WHEN NEW.status = 'confirmed' THEN 'booking_confirmed' ELSE 'booking_pending' END,
      CASE WHEN NEW.status = 'confirmed' THEN 'Booking Confirmed' ELSE 'Booking Pending' END,
      'Your ' || coalesce(v_service_name, 'service') || ' booking for ' || NEW.date::text || ' is ' || NEW.status,
      jsonb_build_object('booking_id', NEW.id, 'business_id', NEW.business_id)
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify client of status change
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.client_id,
      'booking_' || NEW.status,
      'Booking ' || initcap(replace(NEW.status, '_', ' ')),
      'Your booking for ' || NEW.date::text || ' has been ' || replace(NEW.status, '_', ' '),
      jsonb_build_object('booking_id', NEW.id, 'business_id', NEW.business_id)
    );

    -- If cancelled, also notify the other party
    IF NEW.status = 'cancelled' THEN
      -- If cancelled by client, notify business owner
      IF NEW.cancelled_by = NEW.client_id THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
          v_business_owner_id,
          'booking_cancelled',
          'Booking Cancelled',
          coalesce(v_client_name, 'A client') || ' cancelled their ' || coalesce(v_service_name, 'service') || ' booking for ' || NEW.date::text,
          jsonb_build_object('booking_id', NEW.id, 'business_id', NEW.business_id)
        );
      -- If cancelled by business, client already notified above
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on booking changes
DROP TRIGGER IF EXISTS on_booking_change ON public.bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_notification();

-- Function: create notification when a review is submitted
CREATE OR REPLACE FUNCTION public.handle_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_business_owner_id UUID;
  v_client_name TEXT;
BEGIN
  SELECT owner_id INTO v_business_owner_id
    FROM public.businesses WHERE id = NEW.business_id;
  SELECT full_name INTO v_client_name
    FROM public.profiles WHERE id = NEW.client_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_business_owner_id,
    'new_review',
    'New Review',
    coalesce(v_client_name, 'A client') || ' left a ' || NEW.rating || '-star review',
    jsonb_build_object('review_id', NEW.id, 'business_id', NEW.business_id, 'rating', NEW.rating)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new reviews
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_notification();

-- =============================================================================
-- 4. RLS POLICY FIX: Allow notification inserts from triggers (SECURITY DEFINER)
-- =============================================================================

-- Allow the trigger functions to insert notifications
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_trigger_insert'
  ) THEN
    CREATE POLICY "notifications_trigger_insert" ON public.notifications
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow users to delete their own notifications
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_delete_own'
  ) THEN
    CREATE POLICY "notifications_delete_own" ON public.notifications
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;
