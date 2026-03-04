-- ============================================
-- Fix: Hardcode Supabase URL and service_role_key in trigger functions
-- ============================================
-- Supabase doesn't allow ALTER DATABASE SET for custom GUC parameters,
-- so we replace current_setting() calls with hardcoded values.

-- ============================================
-- BOOKING NOTIFICATION TRIGGER (v2 - fixed)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_business_owner_id UUID;
  v_worker_user_id UUID;
  v_service_name TEXT;
  v_client_name TEXT;
  v_business_name TEXT;
  v_msg TEXT;
  v_url TEXT := 'https://lfzoabrdhadvwdwkkgor.supabase.co/functions/v1/notify';
  v_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmem9hYnJkaGFkdndkd2trZ29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1NTc1OSwiZXhwIjoyMDg1ODMxNzU5fQ.fYJiPqb92igAD7sXyc4I_PWtJw7UovX8SvqEpJbLWo0';
BEGIN
  -- Look up related data
  SELECT b.owner_id, b.name INTO v_business_owner_id, v_business_name
    FROM public.businesses b WHERE b.id = NEW.business_id;
  SELECT name INTO v_service_name
    FROM public.services WHERE id = NEW.service_id;
  SELECT full_name INTO v_client_name
    FROM public.profiles WHERE id = NEW.client_id;
  SELECT user_id INTO v_worker_user_id
    FROM public.workers WHERE id = NEW.worker_id;

  IF TG_OP = 'INSERT' THEN
    -- === In-app notifications ===

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

    -- === SMS + Push via Edge Function ===

    -- SMS to client: booking confirmation
    v_msg := 'Your ' || coalesce(v_service_name, 'service') || ' booking at ' || coalesce(v_business_name, 'the business') || ' for ' || NEW.date::text || ' is ' || NEW.status || '.';
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
      body := jsonb_build_object(
        'user_id', NEW.client_id,
        'type', 'booking_created',
        'title', 'Booking ' || initcap(NEW.status),
        'body', v_msg,
        'data', jsonb_build_object('booking_id', NEW.id),
        'channels', jsonb_build_array('sms')
      )::text
    );

    -- SMS + Push to business owner: new booking
    v_msg := coalesce(v_client_name, 'A client') || ' booked ' || coalesce(v_service_name, 'a service') || ' for ' || NEW.date::text || '.';
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
      body := jsonb_build_object(
        'user_id', v_business_owner_id,
        'type', 'booking_created',
        'title', 'New Booking',
        'body', v_msg,
        'data', jsonb_build_object('booking_id', NEW.id),
        'channels', jsonb_build_array('sms', 'push')
      )::text
    );

    -- SMS + Push to worker: new booking
    IF v_worker_user_id IS NOT NULL AND v_worker_user_id IS DISTINCT FROM v_business_owner_id THEN
      v_msg := 'New booking: ' || coalesce(v_service_name, 'a service') || ' on ' || NEW.date::text || ' at ' || NEW.start_time || '.';
      PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
        body := jsonb_build_object(
          'user_id', v_worker_user_id,
          'type', 'booking_created',
          'title', 'New Booking',
          'body', v_msg,
          'data', jsonb_build_object('booking_id', NEW.id),
          'channels', jsonb_build_array('sms', 'push')
        )::text
      );
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- === In-app notifications ===

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
      IF NEW.cancelled_by = NEW.client_id THEN
        INSERT INTO public.notifications (user_id, type, title, body, data)
        VALUES (
          v_business_owner_id,
          'booking_cancelled',
          'Booking Cancelled',
          coalesce(v_client_name, 'A client') || ' cancelled their ' || coalesce(v_service_name, 'service') || ' booking for ' || NEW.date::text,
          jsonb_build_object('booking_id', NEW.id, 'business_id', NEW.business_id)
        );
      END IF;
    END IF;

    -- === SMS + Push via Edge Function ===

    IF NEW.status = 'confirmed' THEN
      -- SMS to client: booking confirmed
      v_msg := 'Your booking at ' || coalesce(v_business_name, 'the business') || ' for ' || NEW.date::text || ' has been confirmed!';
      PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
        body := jsonb_build_object(
          'user_id', NEW.client_id,
          'type', 'booking_confirmed',
          'title', 'Booking Confirmed',
          'body', v_msg,
          'data', jsonb_build_object('booking_id', NEW.id),
          'channels', jsonb_build_array('sms')
        )::text
      );

    ELSIF NEW.status = 'cancelled' THEN
      IF NEW.cancelled_by = NEW.client_id THEN
        -- Client cancelled → SMS to owner + worker
        v_msg := coalesce(v_client_name, 'A client') || ' cancelled their ' || coalesce(v_service_name, 'service') || ' booking for ' || NEW.date::text || '.';
        PERFORM net.http_post(
          url := v_url,
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
          body := jsonb_build_object(
            'user_id', v_business_owner_id,
            'type', 'booking_cancelled',
            'title', 'Booking Cancelled',
            'body', v_msg,
            'data', jsonb_build_object('booking_id', NEW.id),
            'channels', jsonb_build_array('sms')
          )::text
        );

        IF v_worker_user_id IS NOT NULL AND v_worker_user_id IS DISTINCT FROM v_business_owner_id THEN
          v_msg := 'Cancelled: ' || coalesce(v_service_name, 'a service') || ' on ' || NEW.date::text || ' was cancelled by the client.';
          PERFORM net.http_post(
            url := v_url,
            headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
            body := jsonb_build_object(
              'user_id', v_worker_user_id,
              'type', 'booking_cancelled',
              'title', 'Booking Cancelled',
              'body', v_msg,
              'data', jsonb_build_object('booking_id', NEW.id),
              'channels', jsonb_build_array('sms')
            )::text
          );
        END IF;

      ELSE
        -- Business/worker cancelled → SMS to client
        v_msg := 'Your ' || coalesce(v_service_name, 'service') || ' booking at ' || coalesce(v_business_name, 'the business') || ' for ' || NEW.date::text || ' has been cancelled.';
        PERFORM net.http_post(
          url := v_url,
          headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
          body := jsonb_build_object(
            'user_id', NEW.client_id,
            'type', 'booking_cancelled',
            'title', 'Booking Cancelled',
            'body', v_msg,
            'data', jsonb_build_object('booking_id', NEW.id),
            'channels', jsonb_build_array('sms')
          )::text
        );
      END IF;

    ELSIF NEW.status = 'completed' THEN
      -- Push to client: booking completed (invite to review)
      PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
        body := jsonb_build_object(
          'user_id', NEW.client_id,
          'type', 'booking_completed',
          'title', 'How was your visit?',
          'body', 'Your appointment at ' || coalesce(v_business_name, 'the business') || ' is complete. Leave a review!',
          'data', jsonb_build_object('booking_id', NEW.id),
          'channels', jsonb_build_array('push')
        )::text
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REVIEW NOTIFICATION TRIGGER (v2 - fixed)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_business_owner_id UUID;
  v_business_name TEXT;
  v_client_name TEXT;
  v_msg TEXT;
  v_url TEXT := 'https://lfzoabrdhadvwdwkkgor.supabase.co/functions/v1/notify';
  v_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmem9hYnJkaGFkdndkd2trZ29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1NTc1OSwiZXhwIjoyMDg1ODMxNzU5fQ.fYJiPqb92igAD7sXyc4I_PWtJw7UovX8SvqEpJbLWo0';
BEGIN
  SELECT b.owner_id, b.name INTO v_business_owner_id, v_business_name
    FROM public.businesses b WHERE b.id = NEW.business_id;
  SELECT full_name INTO v_client_name
    FROM public.profiles WHERE id = NEW.client_id;

  -- In-app notification
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_business_owner_id,
    'new_review',
    'New Review',
    coalesce(v_client_name, 'A client') || ' left a ' || NEW.rating || '-star review',
    jsonb_build_object('review_id', NEW.id, 'business_id', NEW.business_id, 'rating', NEW.rating)
  );

  -- SMS + Push to business owner via Edge Function
  v_msg := coalesce(v_client_name, 'A client') || ' left a ' || NEW.rating || '-star review on ' || coalesce(v_business_name, 'your business') || '.';
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
    body := jsonb_build_object(
      'user_id', v_business_owner_id,
      'type', 'new_review',
      'title', 'New Review',
      'body', v_msg,
      'data', jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating),
      'channels', jsonb_build_array('sms', 'push')
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fix DAILY REMINDERS CRON JOB (hardcoded URL)
-- ============================================
SELECT cron.unschedule('daily-reminders');

SELECT cron.schedule(
  'daily-reminders',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lfzoabrdhadvwdwkkgor.supabase.co/functions/v1/daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmem9hYnJkaGFkdndkd2trZ29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1NTc1OSwiZXhwIjoyMDg1ODMxNzU5fQ.fYJiPqb92igAD7sXyc4I_PWtJw7UovX8SvqEpJbLWo0'
    ),
    body := '{}'::jsonb
  );
  $$
);
