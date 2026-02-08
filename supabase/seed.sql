-- ============================================
-- BookEasely Seed Data
-- All passwords: password123
-- ============================================

-- ============================================
-- 1. AUTH USERS (trigger creates profiles)
-- ============================================

-- Admin
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Admin User","phone":"(555) 100-0000","role":"admin"}'::jsonb, 'authenticated', 'authenticated', now(), now());

-- Business Owners
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'owner1@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Maria Rodriguez","phone":"(555) 200-0001","role":"business_owner"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'owner2@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"James Chen","phone":"(555) 200-0002","role":"business_owner"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'owner3@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Sarah Johnson","phone":"(555) 200-0003","role":"business_owner"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'owner4@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"David Kim","phone":"(555) 200-0004","role":"business_owner"}'::jsonb, 'authenticated', 'authenticated', now(), now());

-- Clients
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'client1@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Alex Thompson","phone":"(555) 300-0001","role":"client"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'client2@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Emma Wilson","phone":"(555) 300-0002","role":"client"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'client3@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Michael Brown","phone":"(555) 300-0003","role":"client"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'client4@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Sofia Garcia","phone":"(555) 300-0004","role":"client"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'client5@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Ryan Davis","phone":"(555) 300-0005","role":"client"}'::jsonb, 'authenticated', 'authenticated', now(), now());

-- Workers
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'worker1@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Carlos Mendez","phone":"(555) 400-0001","role":"worker"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'worker2@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Lisa Park","phone":"(555) 400-0002","role":"worker"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'worker3@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Ahmed Hassan","phone":"(555) 400-0003","role":"worker"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'worker4@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Nina Patel","phone":"(555) 400-0004","role":"worker"}'::jsonb, 'authenticated', 'authenticated', now(), now());
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at)
VALUES ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'worker5@bookeasely.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), '{"full_name":"Jake Williams","phone":"(555) 400-0005","role":"worker"}'::jsonb, 'authenticated', 'authenticated', now(), now());

-- Mark all profiles as onboarding completed
UPDATE public.profiles SET onboarding_completed = true;

-- ============================================
-- 2. BUSINESSES
-- ============================================

-- Get category IDs by slug
INSERT INTO public.businesses (id, owner_id, name, slug, description, category_id, address, city, state, zip_code, phone, email, website, auto_confirm, cancellation_hours, buffer_minutes)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'The Gentleman''s Cut', 'the-gentlemans-cut',
   'Premium barbershop offering classic and modern cuts in a relaxed atmosphere. Walk-ins welcome.',
   (SELECT id FROM public.categories WHERE slug = 'barbershop'),
   '123 Main Street', 'Miami', 'FL', '33101', '(305) 555-0101', 'info@gentlemanscut.com', 'https://gentlemanscut.com', true, 24, 10),

  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Serenity Spa & Wellness', 'serenity-spa-wellness',
   'A tranquil escape offering massages, facials, and body treatments. Let us help you unwind.',
   (SELECT id FROM public.categories WHERE slug = 'spa-massage'),
   '456 Ocean Drive', 'Miami', 'FL', '33139', '(305) 555-0202', 'hello@serenityspa.com', 'https://serenityspa.com', false, 48, 15),

  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'FitZone Studio', 'fitzone-studio',
   'Personal training and group fitness classes for all levels. Transform your body and mind.',
   (SELECT id FROM public.categories WHERE slug = 'fitness-training'),
   '789 Park Ave', 'Orlando', 'FL', '32801', '(407) 555-0303', 'train@fitzone.com', 'https://fitzone.com', true, 12, 5),

  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Pawfect Grooming', 'pawfect-grooming',
   'Professional pet grooming with love and care. Your furry friends deserve the best!',
   (SELECT id FROM public.categories WHERE slug = 'pet-services'),
   '321 Elm Street', 'Tampa', 'FL', '33602', '(813) 555-0404', 'woof@pawfect.com', 'https://pawfect.com', true, 24, 15),

  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Glow Beauty Bar', 'glow-beauty-bar',
   'Nails, lashes, and beauty treatments to make you shine. Book your glow-up today.',
   (SELECT id FROM public.categories WHERE slug = 'beauty-aesthetics'),
   '555 Brickell Ave', 'Miami', 'FL', '33131', '(305) 555-0505', 'beauty@glowbar.com', NULL, true, 24, 10),

  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Elite Auto Detail', 'elite-auto-detail',
   'Professional car detailing and ceramic coating. We treat your car like our own.',
   (SELECT id FROM public.categories WHERE slug = 'auto-services'),
   '900 Federal Hwy', 'Fort Lauderdale', 'FL', '33301', '(954) 555-0606', 'detail@eliteauto.com', 'https://eliteauto.com', false, 24, 30),

  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'BrightMinds Tutoring', 'brightminds-tutoring',
   'Expert tutoring in math, science, and test prep. Helping students reach their full potential.',
   (SELECT id FROM public.categories WHERE slug = 'tutoring-education'),
   '200 College Blvd', 'Orlando', 'FL', '32817', '(407) 555-0707', 'learn@brightminds.com', 'https://brightminds.com', true, 12, 5),

  ('e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'Ink & Soul Tattoo', 'ink-and-soul-tattoo',
   'Custom tattoos and piercings by award-winning artists. Walk-ins and appointments available.',
   (SELECT id FROM public.categories WHERE slug = 'tattoo-piercing'),
   '777 7th Ave', 'Tampa', 'FL', '33606', '(813) 555-0808', 'ink@inkandsoul.com', 'https://inkandsoul.com', false, 48, 15);

-- ============================================
-- 3. BUSINESS HOURS
-- ============================================
-- day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

-- The Gentleman's Cut (Mon-Sat 9-19, Sun 10-15)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000001', 0, '10:00', '15:00', false),
  ('e0000000-0000-0000-0000-000000000001', 1, '09:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000001', 2, '09:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000001', 3, '09:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000001', 4, '09:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000001', 5, '09:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000001', 6, '09:00', '17:00', false);

-- Serenity Spa (Tue-Sat 10-20, Mon+Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000002', 0, '09:00', '17:00', true),
  ('e0000000-0000-0000-0000-000000000002', 1, '09:00', '17:00', true),
  ('e0000000-0000-0000-0000-000000000002', 2, '10:00', '20:00', false),
  ('e0000000-0000-0000-0000-000000000002', 3, '10:00', '20:00', false),
  ('e0000000-0000-0000-0000-000000000002', 4, '10:00', '20:00', false),
  ('e0000000-0000-0000-0000-000000000002', 5, '10:00', '20:00', false),
  ('e0000000-0000-0000-0000-000000000002', 6, '10:00', '18:00', false);

-- FitZone (Mon-Fri 6-21, Sat 8-16, Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000003', 0, '08:00', '16:00', true),
  ('e0000000-0000-0000-0000-000000000003', 1, '06:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000003', 2, '06:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000003', 3, '06:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000003', 4, '06:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000003', 5, '06:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000003', 6, '08:00', '16:00', false);

-- Pawfect Grooming (Mon-Sat 8-18, Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000004', 0, '08:00', '18:00', true),
  ('e0000000-0000-0000-0000-000000000004', 1, '08:00', '18:00', false),
  ('e0000000-0000-0000-0000-000000000004', 2, '08:00', '18:00', false),
  ('e0000000-0000-0000-0000-000000000004', 3, '08:00', '18:00', false),
  ('e0000000-0000-0000-0000-000000000004', 4, '08:00', '18:00', false),
  ('e0000000-0000-0000-0000-000000000004', 5, '08:00', '18:00', false),
  ('e0000000-0000-0000-0000-000000000004', 6, '09:00', '15:00', false);

-- Glow Beauty Bar (Mon-Sat 10-19, Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000005', 0, '10:00', '19:00', true),
  ('e0000000-0000-0000-0000-000000000005', 1, '10:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000005', 2, '10:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000005', 3, '10:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000005', 4, '10:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000005', 5, '10:00', '19:00', false),
  ('e0000000-0000-0000-0000-000000000005', 6, '10:00', '17:00', false);

-- Elite Auto Detail (Mon-Sat 8-17, Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000006', 0, '08:00', '17:00', true),
  ('e0000000-0000-0000-0000-000000000006', 1, '08:00', '17:00', false),
  ('e0000000-0000-0000-0000-000000000006', 2, '08:00', '17:00', false),
  ('e0000000-0000-0000-0000-000000000006', 3, '08:00', '17:00', false),
  ('e0000000-0000-0000-0000-000000000006', 4, '08:00', '17:00', false),
  ('e0000000-0000-0000-0000-000000000006', 5, '08:00', '17:00', false),
  ('e0000000-0000-0000-0000-000000000006', 6, '09:00', '14:00', false);

-- BrightMinds Tutoring (Mon-Fri 14-21, Sat 9-17, Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000007', 0, '09:00', '17:00', true),
  ('e0000000-0000-0000-0000-000000000007', 1, '14:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000007', 2, '14:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000007', 3, '14:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000007', 4, '14:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000007', 5, '14:00', '21:00', false),
  ('e0000000-0000-0000-0000-000000000007', 6, '09:00', '17:00', false);

-- Ink & Soul Tattoo (Tue-Sat 12-22, Mon+Sun closed)
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('e0000000-0000-0000-0000-000000000008', 0, '12:00', '22:00', true),
  ('e0000000-0000-0000-0000-000000000008', 1, '12:00', '22:00', true),
  ('e0000000-0000-0000-0000-000000000008', 2, '12:00', '22:00', false),
  ('e0000000-0000-0000-0000-000000000008', 3, '12:00', '22:00', false),
  ('e0000000-0000-0000-0000-000000000008', 4, '12:00', '22:00', false),
  ('e0000000-0000-0000-0000-000000000008', 5, '12:00', '22:00', false),
  ('e0000000-0000-0000-0000-000000000008', 6, '12:00', '20:00', false);

-- ============================================
-- 4. WORKERS
-- ============================================

-- Barbershop: owner Maria + 2 workers
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Maria Rodriguez', 'Master barber with 15 years experience', ARRAY['Fades', 'Classic Cuts', 'Beard Styling']),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Carlos Mendez', 'Specializes in modern fades and designs', ARRAY['Fades', 'Hair Designs', 'Kids Cuts']),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Lisa Park', 'Expert in Asian and textured hair', ARRAY['Textured Hair', 'Straight Razor', 'Coloring']);

-- Spa: owner James + 2 workers
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'James Chen', 'Licensed massage therapist and spa owner', ARRAY['Deep Tissue', 'Hot Stone', 'Reflexology']),
  ('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'Ahmed Hassan', 'Certified esthetician with 8 years experience', ARRAY['Facials', 'Chemical Peels', 'Microdermabrasion']),
  ('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'Nina Patel', 'Specializes in Swedish and prenatal massage', ARRAY['Swedish Massage', 'Prenatal', 'Aromatherapy']);

-- FitZone: owner Sarah + 1 worker
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Sarah Johnson', 'NASM certified trainer and studio owner', ARRAY['Strength Training', 'HIIT', 'Nutrition']),
  ('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'Jake Williams', 'CrossFit L2 trainer and mobility specialist', ARRAY['CrossFit', 'Mobility', 'Group Classes']);

-- Pawfect: owner David (solo)
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'David Kim', 'Certified pet groomer with a gentle touch', ARRAY['Dog Grooming', 'Cat Grooming', 'Breed-Specific Cuts']);

-- Glow Beauty: owner Maria (solo - second business)
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'Maria Rodriguez', 'Beauty specialist and nail artist', ARRAY['Gel Nails', 'Lash Extensions', 'Waxing']);

-- Elite Auto: owner James (solo - second business)
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000006', 'James Chen', 'Professional detailer with OCD-level attention', ARRAY['Ceramic Coating', 'Paint Correction', 'Interior Detail']);

-- BrightMinds: owner Sarah (solo - second business)
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000007', 'Sarah Johnson', 'Former math teacher, SAT prep expert', ARRAY['Math', 'SAT/ACT Prep', 'Science']);

-- Ink & Soul: owner David + 1 worker
INSERT INTO public.workers (id, user_id, business_id, display_name, bio, specialties) VALUES
  ('f0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', 'David Kim', 'Fine line and geometric tattoo artist', ARRAY['Fine Line', 'Geometric', 'Blackwork']),
  ('f0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 'Carlos Mendez', 'Color realism and portrait specialist', ARRAY['Color Realism', 'Portraits', 'Cover-ups']);

-- ============================================
-- 5. WORKER AVAILABILITY (Mon-Sat for each)
-- ============================================

-- Worker f001 (Maria @ Barbershop)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000001', 1, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000001', 2, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000001', 3, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000001', 4, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000001', 5, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000001', 6, '10:00', '15:00');

-- Worker f002 (Carlos @ Barbershop)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000002', 1, '10:00', '19:00'),
  ('f0000000-0000-0000-0000-000000000002', 2, '10:00', '19:00'),
  ('f0000000-0000-0000-0000-000000000002', 3, '10:00', '19:00'),
  ('f0000000-0000-0000-0000-000000000002', 4, '10:00', '19:00'),
  ('f0000000-0000-0000-0000-000000000002', 5, '10:00', '19:00'),
  ('f0000000-0000-0000-0000-000000000002', 6, '09:00', '17:00');

-- Worker f003 (Lisa @ Barbershop)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000003', 0, '10:00', '15:00'),
  ('f0000000-0000-0000-0000-000000000003', 2, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000003', 3, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000003', 4, '09:00', '17:00'),
  ('f0000000-0000-0000-0000-000000000003', 5, '09:00', '17:00');

-- Worker f004 (James @ Spa)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000004', 2, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000004', 3, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000004', 4, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000004', 5, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000004', 6, '10:00', '16:00');

-- Worker f005 (Ahmed @ Spa)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000005', 2, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000005', 3, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000005', 4, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000005', 5, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000005', 6, '10:00', '18:00');

-- Worker f006 (Nina @ Spa)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000006', 2, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000006', 3, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000006', 5, '10:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000006', 6, '10:00', '16:00');

-- Worker f007 (Sarah @ FitZone)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000007', 1, '06:00', '14:00'),
  ('f0000000-0000-0000-0000-000000000007', 2, '06:00', '14:00'),
  ('f0000000-0000-0000-0000-000000000007', 3, '06:00', '14:00'),
  ('f0000000-0000-0000-0000-000000000007', 4, '06:00', '14:00'),
  ('f0000000-0000-0000-0000-000000000007', 5, '06:00', '14:00'),
  ('f0000000-0000-0000-0000-000000000007', 6, '08:00', '12:00');

-- Worker f008 (Jake @ FitZone)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000008', 1, '14:00', '21:00'),
  ('f0000000-0000-0000-0000-000000000008', 2, '14:00', '21:00'),
  ('f0000000-0000-0000-0000-000000000008', 3, '14:00', '21:00'),
  ('f0000000-0000-0000-0000-000000000008', 4, '14:00', '21:00'),
  ('f0000000-0000-0000-0000-000000000008', 5, '14:00', '21:00'),
  ('f0000000-0000-0000-0000-000000000008', 6, '09:00', '16:00');

-- Worker f009 (David @ Pawfect - solo)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000009', 1, '08:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000009', 2, '08:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000009', 3, '08:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000009', 4, '08:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000009', 5, '08:00', '18:00'),
  ('f0000000-0000-0000-0000-000000000009', 6, '09:00', '15:00');

-- Worker f013 (David @ Ink & Soul)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000013', 2, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000013', 3, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000013', 4, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000013', 5, '12:00', '20:00'),
  ('f0000000-0000-0000-0000-000000000013', 6, '12:00', '18:00');

-- Worker f014 (Carlos @ Ink & Soul)
INSERT INTO public.worker_availability (worker_id, day_of_week, start_time, end_time) VALUES
  ('f0000000-0000-0000-0000-000000000014', 3, '14:00', '22:00'),
  ('f0000000-0000-0000-0000-000000000014', 4, '14:00', '22:00'),
  ('f0000000-0000-0000-0000-000000000014', 5, '14:00', '22:00'),
  ('f0000000-0000-0000-0000-000000000014', 6, '12:00', '20:00');

-- ============================================
-- 6. WORKER BLOCKED DATES
-- ============================================
INSERT INTO public.worker_blocked_dates (worker_id, date, start_time, end_time, reason) VALUES
  ('f0000000-0000-0000-0000-000000000001', CURRENT_DATE + 14, NULL, NULL, 'Vacation'),
  ('f0000000-0000-0000-0000-000000000001', CURRENT_DATE + 15, NULL, NULL, 'Vacation'),
  ('f0000000-0000-0000-0000-000000000002', CURRENT_DATE + 7, '09:00', '13:00', 'Doctor appointment'),
  ('f0000000-0000-0000-0000-000000000005', CURRENT_DATE + 10, NULL, NULL, 'Personal day'),
  ('f0000000-0000-0000-0000-000000000007', CURRENT_DATE + 21, NULL, NULL, 'Conference'),
  ('f0000000-0000-0000-0000-000000000007', CURRENT_DATE + 22, NULL, NULL, 'Conference'),
  ('f0000000-0000-0000-0000-000000000009', CURRENT_DATE + 5, '14:00', '18:00', 'Vet appointment');

-- ============================================
-- 7. SERVICES
-- ============================================

-- The Gentleman's Cut
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Classic Haircut', 'Traditional scissor or clipper cut with hot towel finish', 28.00, 30),
  ('aa000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Fade Haircut', 'Skin fade, mid fade, or taper fade with lineup', 35.00, 40),
  ('aa000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Beard Trim & Shape', 'Precision beard trimming with hot towel', 15.00, 15),
  ('aa000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Hot Towel Shave', 'Straight razor shave with premium lather', 30.00, 30),
  ('aa000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'Kids Haircut', 'Haircut for children 12 and under', 18.00, 20);

-- Serenity Spa
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', 'Deep Tissue Massage', 'Firm pressure targeting muscle tension and knots', 95.00, 60),
  ('aa000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000002', 'Swedish Massage', 'Relaxing full-body massage with long flowing strokes', 80.00, 60),
  ('aa000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000002', 'Signature Facial', 'Deep cleansing facial with extraction and mask', 70.00, 45),
  ('aa000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000002', 'Hot Stone Massage', 'Heated basalt stones for deep relaxation', 115.00, 90),
  ('aa000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000002', 'Couples Massage', 'Side-by-side Swedish massage for two', 150.00, 60);

-- FitZone Studio
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000003', 'Personal Training Session', 'One-on-one training tailored to your goals', 65.00, 60),
  ('aa000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000003', 'Group Fitness Class', 'High-energy group workout (HIIT, yoga, or spin)', 25.00, 45),
  ('aa000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000003', 'Fitness Assessment', 'Body composition analysis and goal setting', 40.00, 30),
  ('aa000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000003', 'Nutrition Consultation', 'Personalized meal planning and macros', 55.00, 45);

-- Pawfect Grooming
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000015', 'e0000000-0000-0000-0000-000000000004', 'Full Dog Grooming', 'Bath, haircut, nail trim, ear cleaning', 55.00, 60),
  ('aa000000-0000-0000-0000-000000000016', 'e0000000-0000-0000-0000-000000000004', 'Cat Grooming', 'Gentle bath, brush-out, and nail trim', 45.00, 45),
  ('aa000000-0000-0000-0000-000000000017', 'e0000000-0000-0000-0000-000000000004', 'Nail Trim Only', 'Quick nail clipping for dogs or cats', 15.00, 15),
  ('aa000000-0000-0000-0000-000000000018', 'e0000000-0000-0000-0000-000000000004', 'Bath & Brush', 'Bath with premium shampoo and thorough brushing', 35.00, 30);

-- Glow Beauty Bar
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000005', 'Gel Manicure', 'Long-lasting gel polish with cuticle care', 40.00, 45),
  ('aa000000-0000-0000-0000-000000000020', 'e0000000-0000-0000-0000-000000000005', 'Classic Pedicure', 'Relaxing foot soak, exfoliation, and polish', 35.00, 40),
  ('aa000000-0000-0000-0000-000000000021', 'e0000000-0000-0000-0000-000000000005', 'Lash Extensions - Full Set', 'Classic or volume lash extensions', 120.00, 90),
  ('aa000000-0000-0000-0000-000000000022', 'e0000000-0000-0000-0000-000000000005', 'Brow Wax & Tint', 'Precision brow shaping with tint', 30.00, 20);

-- Elite Auto Detail
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000023', 'e0000000-0000-0000-0000-000000000006', 'Express Wash & Wax', 'Exterior wash, clay bar, and hand wax', 75.00, 60),
  ('aa000000-0000-0000-0000-000000000024', 'e0000000-0000-0000-0000-000000000006', 'Full Interior Detail', 'Deep clean, vacuum, leather conditioning, odor removal', 120.00, 90),
  ('aa000000-0000-0000-0000-000000000025', 'e0000000-0000-0000-0000-000000000006', 'Ceramic Coating', 'Professional-grade ceramic coating with 2-year warranty', 350.00, 120),
  ('aa000000-0000-0000-0000-000000000026', 'e0000000-0000-0000-0000-000000000006', 'Paint Correction', 'Multi-step polish to remove swirls and scratches', 250.00, 180);

-- BrightMinds Tutoring
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000027', 'e0000000-0000-0000-0000-000000000007', 'Math Tutoring', 'Algebra, geometry, calculus - all levels', 50.00, 60),
  ('aa000000-0000-0000-0000-000000000028', 'e0000000-0000-0000-0000-000000000007', 'SAT/ACT Prep', 'Test strategies and practice sessions', 65.00, 90),
  ('aa000000-0000-0000-0000-000000000029', 'e0000000-0000-0000-0000-000000000007', 'Science Tutoring', 'Biology, chemistry, physics help', 50.00, 60),
  ('aa000000-0000-0000-0000-000000000030', 'e0000000-0000-0000-0000-000000000007', 'Essay Review', 'College application and assignment essay feedback', 35.00, 30);

-- Ink & Soul Tattoo
INSERT INTO public.services (id, business_id, name, description, price, duration_minutes) VALUES
  ('aa000000-0000-0000-0000-000000000031', 'e0000000-0000-0000-0000-000000000008', 'Small Tattoo', 'Flash or simple custom design (up to 3 inches)', 80.00, 45),
  ('aa000000-0000-0000-0000-000000000032', 'e0000000-0000-0000-0000-000000000008', 'Medium Tattoo', 'Custom design (3-6 inches)', 200.00, 120),
  ('aa000000-0000-0000-0000-000000000033', 'e0000000-0000-0000-0000-000000000008', 'Consultation', 'Design discussion and placement planning', 0.00, 30),
  ('aa000000-0000-0000-0000-000000000034', 'e0000000-0000-0000-0000-000000000008', 'Piercing', 'Ear, nose, or body piercing (jewelry included)', 45.00, 20);

-- ============================================
-- 8. SERVICE WORKERS
-- ============================================

-- Barbershop: all 3 workers do all services
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003'),
  ('aa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002'),
  ('aa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003');

-- Spa: massage workers vs facial workers
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006'),
  ('aa000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000006'),
  ('aa000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000005'),
  ('aa000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000004'),
  ('aa000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000006');

-- FitZone: both trainers
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000007'),
  ('aa000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000008'),
  ('aa000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000007'),
  ('aa000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000008'),
  ('aa000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000007'),
  ('aa000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000007');

-- Pawfect: solo operator
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000009'),
  ('aa000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000009'),
  ('aa000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000009'),
  ('aa000000-0000-0000-0000-000000000018', 'f0000000-0000-0000-0000-000000000009');

-- Glow Beauty: solo
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000019', 'f0000000-0000-0000-0000-000000000010'),
  ('aa000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000010'),
  ('aa000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000010'),
  ('aa000000-0000-0000-0000-000000000022', 'f0000000-0000-0000-0000-000000000010');

-- Elite Auto: solo
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000023', 'f0000000-0000-0000-0000-000000000011'),
  ('aa000000-0000-0000-0000-000000000024', 'f0000000-0000-0000-0000-000000000011'),
  ('aa000000-0000-0000-0000-000000000025', 'f0000000-0000-0000-0000-000000000011'),
  ('aa000000-0000-0000-0000-000000000026', 'f0000000-0000-0000-0000-000000000011');

-- BrightMinds: solo
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000027', 'f0000000-0000-0000-0000-000000000012'),
  ('aa000000-0000-0000-0000-000000000028', 'f0000000-0000-0000-0000-000000000012'),
  ('aa000000-0000-0000-0000-000000000029', 'f0000000-0000-0000-0000-000000000012'),
  ('aa000000-0000-0000-0000-000000000030', 'f0000000-0000-0000-0000-000000000012');

-- Ink & Soul: both artists do tattoos, David does piercings
INSERT INTO public.service_workers (service_id, worker_id) VALUES
  ('aa000000-0000-0000-0000-000000000031', 'f0000000-0000-0000-0000-000000000013'),
  ('aa000000-0000-0000-0000-000000000031', 'f0000000-0000-0000-0000-000000000014'),
  ('aa000000-0000-0000-0000-000000000032', 'f0000000-0000-0000-0000-000000000013'),
  ('aa000000-0000-0000-0000-000000000032', 'f0000000-0000-0000-0000-000000000014'),
  ('aa000000-0000-0000-0000-000000000033', 'f0000000-0000-0000-0000-000000000013'),
  ('aa000000-0000-0000-0000-000000000033', 'f0000000-0000-0000-0000-000000000014'),
  ('aa000000-0000-0000-0000-000000000034', 'f0000000-0000-0000-0000-000000000013');

-- ============================================
-- 9. BOOKINGS
-- ============================================

-- Past completed bookings (for reviews)
INSERT INTO public.bookings (id, client_id, business_id, worker_id, service_id, date, start_time, end_time, status, note) VALUES
  ('bb000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', CURRENT_DATE - 30, '10:00', '10:30', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000006', CURRENT_DATE - 25, '14:00', '15:00', 'completed', 'Looking forward to this!'),
  ('bb000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', CURRENT_DATE - 20, '11:00', '11:40', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000011', CURRENT_DATE - 18, '07:00', '08:00', 'completed', 'First session'),
  ('bb000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000009', 'aa000000-0000-0000-0000-000000000015', CURRENT_DATE - 15, '09:00', '10:00', 'completed', 'Golden retriever, 50lbs'),
  ('bb000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000007', CURRENT_DATE - 12, '10:00', '11:00', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000010', 'aa000000-0000-0000-0000-000000000019', CURRENT_DATE - 10, '11:00', '11:45', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000001', CURRENT_DATE - 8, '14:00', '14:30', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000008', 'aa000000-0000-0000-0000-000000000012', CURRENT_DATE - 7, '15:00', '15:45', 'completed', NULL),
  ('bb000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000011', 'aa000000-0000-0000-0000-000000000023', CURRENT_DATE - 5, '09:00', '10:00', 'completed', 'Black BMW X5'),
  ('bb000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000012', 'aa000000-0000-0000-0000-000000000027', CURRENT_DATE - 4, '16:00', '17:00', 'completed', 'Algebra 2 help'),
  ('bb000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000013', 'aa000000-0000-0000-0000-000000000031', CURRENT_DATE - 3, '14:00', '14:45', 'completed', 'Small wrist tattoo');

-- Past cancelled bookings
INSERT INTO public.bookings (id, client_id, business_id, worker_id, service_id, date, start_time, end_time, status, cancelled_by, cancellation_reason) VALUES
  ('bb000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', CURRENT_DATE - 14, '09:00', '09:30', 'cancelled', 'c0000000-0000-0000-0000-000000000003', 'Schedule conflict'),
  ('bb000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000008', CURRENT_DATE - 9, '13:00', '13:45', 'cancelled', 'b0000000-0000-0000-0000-000000000002', 'Worker unavailable'),
  ('bb000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000009', 'aa000000-0000-0000-0000-000000000016', CURRENT_DATE - 6, '11:00', '11:45', 'cancelled', 'c0000000-0000-0000-0000-000000000005', 'Pet is sick');

-- Future confirmed bookings
INSERT INTO public.bookings (id, client_id, business_id, worker_id, service_id, date, start_time, end_time, status) VALUES
  ('bb000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', CURRENT_DATE + 2, '10:00', '10:40', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000007', CURRENT_DATE + 3, '11:00', '12:00', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000011', CURRENT_DATE + 3, '07:00', '08:00', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000010', 'aa000000-0000-0000-0000-000000000021', CURRENT_DATE + 5, '13:00', '14:30', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', CURRENT_DATE + 4, '15:00', '15:30', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000009', 'aa000000-0000-0000-0000-000000000015', CURRENT_DATE + 6, '10:00', '11:00', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000014', 'aa000000-0000-0000-0000-000000000032', CURRENT_DATE + 8, '16:00', '18:00', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000011', 'aa000000-0000-0000-0000-000000000025', CURRENT_DATE + 10, '08:00', '10:00', 'confirmed');

-- Future pending bookings
INSERT INTO public.bookings (id, client_id, business_id, worker_id, service_id, date, start_time, end_time, status, note) VALUES
  ('bb000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000009', CURRENT_DATE + 7, '14:00', '15:30', 'pending', 'Birthday treat!'),
  ('bb000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000013', 'aa000000-0000-0000-0000-000000000033', CURRENT_DATE + 9, '13:00', '13:30', 'pending', 'Want a geometric design on forearm'),
  ('bb000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000008', 'aa000000-0000-0000-0000-000000000012', CURRENT_DATE + 4, '16:00', '16:45', 'pending', NULL),
  ('bb000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000012', 'aa000000-0000-0000-0000-000000000028', CURRENT_DATE + 11, '15:00', '16:30', 'pending', 'SAT prep - math section'),
  ('bb000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000010', 'aa000000-0000-0000-0000-000000000019', CURRENT_DATE + 6, '14:00', '14:45', 'pending', NULL);

-- Today confirmed bookings
INSERT INTO public.bookings (id, client_id, business_id, worker_id, service_id, date, start_time, end_time, status) VALUES
  ('bb000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', CURRENT_DATE, '14:00', '14:30', 'confirmed'),
  ('bb000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000008', CURRENT_DATE, '16:00', '16:45', 'confirmed');

-- ============================================
-- 10. REVIEWS (trigger updates business ratings)
-- ============================================
INSERT INTO public.reviews (booking_id, client_id, business_id, rating, comment, business_response) VALUES
  ('bb000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 5, 'Best haircut I''ve had in years! Maria is amazing.', 'Thank you Alex! We love having you.'),
  ('bb000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 5, 'Incredible deep tissue massage. James really knows his craft.', 'Glad you enjoyed it! See you next time.'),
  ('bb000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 4, 'Great fade, Carlos did a solid job. Waiting area could be nicer.', NULL),
  ('bb000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 5, 'Sarah pushed me to my limits! Exactly what I needed.', 'Keep up the great work Emma!'),
  ('bb000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 5, 'My golden retriever looked beautiful! David is so patient with dogs.', 'Max was a joy to work with!'),
  ('bb000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 4, 'Nina gave a wonderful Swedish massage. Very relaxing atmosphere.', NULL),
  ('bb000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', 5, 'Love my gel nails! They lasted 3 weeks without chipping.', 'So glad you loved them Sofia!'),
  ('bb000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 5, 'Lisa did an amazing job with my haircut. Very precise.', NULL),
  ('bb000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 4, 'Good group class but was pretty crowded. Jake is energetic though!', NULL),
  ('bb000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000006', 5, 'My car looks brand new! Worth every penny.', 'Thanks Ryan! That BMW cleaned up beautifully.'),
  ('bb000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 4, 'Sarah explained concepts clearly. My son improved his grade already.', 'That''s wonderful to hear!'),
  ('bb000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000008', 5, 'David''s fine line work is incredible. Exactly what I wanted.', NULL);

-- ============================================
-- 11. FAVORITES
-- ============================================
INSERT INTO public.favorites (client_id, business_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007'),
  ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000006');

-- ============================================
-- 12. NOTIFICATIONS
-- ============================================
INSERT INTO public.notifications (user_id, type, title, body, is_read, data) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'booking_confirmed', 'Booking Confirmed', 'Your haircut at The Gentleman''s Cut on ' || to_char(CURRENT_DATE + 2, 'Mon DD') || ' at 10:00 AM is confirmed.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000016"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000001', 'booking_confirmed', 'Booking Confirmed', 'Your grooming at Pawfect Grooming on ' || to_char(CURRENT_DATE + 6, 'Mon DD') || ' at 10:00 AM is confirmed.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000021"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000002', 'booking_confirmed', 'Booking Confirmed', 'Your massage at Serenity Spa on ' || to_char(CURRENT_DATE + 3, 'Mon DD') || ' at 11:00 AM is confirmed.', true, '{"booking_id": "bb000000-0000-0000-0000-000000000017"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000003', 'booking_confirmed', 'Booking Confirmed', 'Your training session at FitZone Studio is confirmed.', true, '{"booking_id": "bb000000-0000-0000-0000-000000000018"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000004', 'booking_confirmed', 'Booking Confirmed', 'Your lash extensions at Glow Beauty Bar are confirmed.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000019"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'new_booking', 'New Booking', 'Alex Thompson booked a Fade Haircut for ' || to_char(CURRENT_DATE + 2, 'Mon DD') || '.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000016"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000001', 'new_review', 'New Review', 'Alex Thompson left a 5-star review for The Gentleman''s Cut.', true, '{"business_id": "e0000000-0000-0000-0000-000000000001"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', 'new_booking', 'New Booking', 'Emma Wilson booked a Swedish Massage for ' || to_char(CURRENT_DATE + 3, 'Mon DD') || '.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000017"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', 'booking_cancelled', 'Booking Cancelled', 'Sofia Garcia cancelled their Facial appointment.', true, '{"booking_id": "bb000000-0000-0000-0000-000000000014"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000003', 'new_review', 'New Review', 'Emma Wilson left a 5-star review for FitZone Studio.', false, '{"business_id": "e0000000-0000-0000-0000-000000000003"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000001', 'new_booking', 'New Booking', 'You have a new Fade Haircut appointment on ' || to_char(CURRENT_DATE + 2, 'Mon DD') || ' at 10:00 AM.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000016"}'::jsonb),
  ('d0000000-0000-0000-0000-000000000003', 'booking_reminder', 'Upcoming Appointment', 'Reminder: You have a Facial appointment today at 4:00 PM.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000030"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000003', 'booking_cancelled', 'Booking Cancelled', 'Your Cat Grooming at Pawfect Grooming has been cancelled.', true, '{"booking_id": "bb000000-0000-0000-0000-000000000015"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000005', 'booking_confirmed', 'Booking Confirmed', 'Your Hot Towel Shave at The Gentleman''s Cut is confirmed.', false, '{"booking_id": "bb000000-0000-0000-0000-000000000020"}'::jsonb),
  ('b0000000-0000-0000-0000-000000000004', 'new_review', 'New Review', 'Michael Brown left a 5-star review for Pawfect Grooming!', false, '{"business_id": "e0000000-0000-0000-0000-000000000004"}'::jsonb);

-- ============================================
-- 13. WORKER INVITATIONS
-- ============================================
INSERT INTO public.worker_invitations (business_id, email, display_name, bio, specialties, invited_by, status) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'newworker@example.com', 'Jordan Taylor', 'Certified reflexologist', ARRAY['Reflexology', 'Acupressure'], 'b0000000-0000-0000-0000-000000000002', 'pending'),
  ('e0000000-0000-0000-0000-000000000001', 'declined@example.com', 'Sam Rivera', 'Barber apprentice', ARRAY['Basic Cuts'], 'b0000000-0000-0000-0000-000000000001', 'declined'),
  ('e0000000-0000-0000-0000-000000000003', 'expired@example.com', 'Pat Morgan', 'Yoga instructor', ARRAY['Yoga', 'Pilates'], 'b0000000-0000-0000-0000-000000000003', 'expired');
