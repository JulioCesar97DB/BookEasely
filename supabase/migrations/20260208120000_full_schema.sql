-- BookEasely Full Schema
-- Consolidated migration: initial schema + phase 2 + worker invitations

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'business_owner', 'worker', 'admin')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- BUSINESSES
-- ============================================
CREATE TABLE public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  zip_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  website TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  cover_image_url TEXT,
  logo_url TEXT,
  cancellation_policy TEXT,
  cancellation_hours INTEGER NOT NULL DEFAULT 24,
  auto_confirm BOOLEAN NOT NULL DEFAULT true,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BUSINESS HOURS
-- ============================================
CREATE TABLE public.business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(business_id, day_of_week),
  CHECK (open_time < close_time)
);

-- ============================================
-- WORKERS
-- ============================================
CREATE TABLE public.workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- ============================================
-- WORKER AVAILABILITY
-- ============================================
CREATE TABLE public.worker_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(worker_id, day_of_week),
  CHECK (start_time < end_time)
);

-- ============================================
-- WORKER BLOCKED DATES
-- ============================================
CREATE TABLE public.worker_blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT
);

-- ============================================
-- WORKER INVITATIONS
-- ============================================
CREATE TABLE public.worker_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(email, business_id)
);

-- ============================================
-- SERVICES
-- ============================================
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- SERVICE <-> WORKERS (many-to-many)
-- ============================================
CREATE TABLE public.service_workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  UNIQUE(service_id, worker_id)
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  note TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  business_response TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, business_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_category ON public.businesses(category_id);
CREATE INDEX idx_businesses_active ON public.businesses(is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_location ON public.businesses(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_business_hours_business ON public.business_hours(business_id);
CREATE INDEX idx_workers_business ON public.workers(business_id);
CREATE INDEX idx_workers_user ON public.workers(user_id);
CREATE INDEX idx_worker_availability_worker ON public.worker_availability(worker_id);
CREATE INDEX idx_worker_blocked_dates_worker ON public.worker_blocked_dates(worker_id);
CREATE INDEX idx_worker_blocked_dates_date ON public.worker_blocked_dates(worker_id, date);
CREATE INDEX idx_worker_invitations_business ON public.worker_invitations(business_id);
CREATE INDEX idx_worker_invitations_email ON public.worker_invitations(email);
CREATE INDEX idx_services_business ON public.services(business_id);
CREATE INDEX idx_service_workers_service ON public.service_workers(service_id);
CREATE INDEX idx_service_workers_worker ON public.service_workers(worker_id);
CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_business ON public.bookings(business_id);
CREATE INDEX idx_bookings_worker ON public.bookings(worker_id);
CREATE INDEX idx_bookings_worker_date ON public.bookings(worker_id, date, start_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_reviews_business ON public.reviews(business_id);
CREATE INDEX idx_reviews_client ON public.reviews(client_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_favorites_client ON public.favorites(client_id);
CREATE INDEX idx_favorites_business ON public.favorites(business_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);

-- BUSINESSES
CREATE POLICY "businesses_select" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "businesses_select_own" ON public.businesses FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "businesses_insert" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "businesses_update" ON public.businesses FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "businesses_delete" ON public.businesses FOR DELETE USING (owner_id = auth.uid());

-- BUSINESS_HOURS
CREATE POLICY "business_hours_select" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "business_hours_manage" ON public.business_hours FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_hours.business_id AND owner_id = auth.uid())
);

-- WORKERS
CREATE POLICY "workers_select" ON public.workers FOR SELECT USING (true);
CREATE POLICY "workers_manage" ON public.workers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = workers.business_id AND owner_id = auth.uid())
);

-- WORKER_AVAILABILITY
CREATE POLICY "worker_availability_select" ON public.worker_availability FOR SELECT USING (true);
CREATE POLICY "worker_availability_manage_owner" ON public.worker_availability FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workers w
    JOIN public.businesses b ON b.id = w.business_id
    WHERE w.id = worker_availability.worker_id AND b.owner_id = auth.uid()
  )
);
CREATE POLICY "worker_availability_manage_self" ON public.worker_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workers WHERE id = worker_availability.worker_id AND user_id = auth.uid())
);

-- WORKER_BLOCKED_DATES
CREATE POLICY "worker_blocked_dates_select" ON public.worker_blocked_dates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workers WHERE id = worker_blocked_dates.worker_id AND user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.workers w
    JOIN public.businesses b ON b.id = w.business_id
    WHERE w.id = worker_blocked_dates.worker_id AND b.owner_id = auth.uid()
  )
);
CREATE POLICY "worker_blocked_dates_manage_owner" ON public.worker_blocked_dates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workers w
    JOIN public.businesses b ON b.id = w.business_id
    WHERE w.id = worker_blocked_dates.worker_id AND b.owner_id = auth.uid()
  )
);
CREATE POLICY "worker_blocked_dates_manage_self" ON public.worker_blocked_dates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workers WHERE id = worker_blocked_dates.worker_id AND user_id = auth.uid())
);

-- WORKER_INVITATIONS
CREATE POLICY "worker_invitations_manage_owner" ON public.worker_invitations FOR ALL USING (
  business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "worker_invitations_select_self" ON public.worker_invitations FOR SELECT USING (
  email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- SERVICES
CREATE POLICY "services_select" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_manage" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = services.business_id AND owner_id = auth.uid())
);

-- SERVICE_WORKERS
CREATE POLICY "service_workers_select" ON public.service_workers FOR SELECT USING (true);
CREATE POLICY "service_workers_manage" ON public.service_workers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.services s
    JOIN public.businesses b ON b.id = s.business_id
    WHERE s.id = service_workers.service_id AND b.owner_id = auth.uid()
  )
);

-- BOOKINGS
CREATE POLICY "bookings_select_client" ON public.bookings FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "bookings_select_owner" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = bookings.business_id AND owner_id = auth.uid())
);
CREATE POLICY "bookings_select_worker" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workers WHERE id = bookings.worker_id AND user_id = auth.uid())
);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "bookings_update_client" ON public.bookings FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "bookings_update_owner" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = bookings.business_id AND owner_id = auth.uid())
);
CREATE POLICY "bookings_update_worker" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workers WHERE id = bookings.worker_id AND user_id = auth.uid())
);

-- REVIEWS
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (is_flagged = false);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.bookings WHERE id = reviews.booking_id AND client_id = auth.uid() AND status = 'completed')
);
CREATE POLICY "reviews_update_owner" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = reviews.business_id AND owner_id = auth.uid())
);

-- NOTIFICATIONS
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- FAVORITES
CREATE POLICY "favorites_select" ON public.favorites FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "favorites_insert" ON public.favorites FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "favorites_delete" ON public.favorites FOR DELETE USING (client_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-link pending invitations when a new profile is created
CREATE OR REPLACE FUNCTION public.handle_worker_invitation_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN
    SELECT * FROM public.worker_invitations
    WHERE email = NEW.email AND status = 'pending'
  LOOP
    INSERT INTO public.workers (user_id, business_id, display_name, bio, specialties, is_active)
    VALUES (NEW.id, inv.business_id, inv.display_name, inv.bio, inv.specialties, true)
    ON CONFLICT (user_id, business_id) DO NOTHING;

    UPDATE public.worker_invitations SET status = 'accepted', accepted_at = now() WHERE id = inv.id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_check_invitations
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_worker_invitation_on_signup();

-- Update business rating on new/updated review
CREATE OR REPLACE FUNCTION public.handle_review_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses
  SET
    rating_avg = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE business_id = NEW.business_id AND is_flagged = false),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE business_id = NEW.business_id AND is_flagged = false)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_rating();

CREATE TRIGGER on_review_updated
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_rating();

-- ============================================
-- SEED: Default Categories
-- ============================================
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Barbershop', 'barbershop', 1),
  ('Hair Salon', 'hair-salon', 2),
  ('Nail Salon', 'nail-salon', 3),
  ('Spa & Massage', 'spa-massage', 4),
  ('Fitness & Training', 'fitness-training', 5),
  ('Medical & Dental', 'medical-dental', 6),
  ('Beauty & Aesthetics', 'beauty-aesthetics', 7),
  ('Consulting', 'consulting', 8),
  ('Tutoring & Education', 'tutoring-education', 9),
  ('Pet Services', 'pet-services', 10),
  ('Auto Services', 'auto-services', 11),
  ('Home Services', 'home-services', 12),
  ('Photography', 'photography', 13),
  ('Tattoo & Piercing', 'tattoo-piercing', 14),
  ('Other', 'other', 99);
