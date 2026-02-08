-- 1. Revert nullable user_id (restore NOT NULL)
DELETE FROM public.workers WHERE user_id IS NULL;
ALTER TABLE public.workers ALTER COLUMN user_id SET NOT NULL;

-- 2. Drop the partial unique index we created, restore original constraint
DROP INDEX IF EXISTS workers_user_id_business_id_unique;
ALTER TABLE public.workers ADD CONSTRAINT workers_user_id_business_id_key UNIQUE (user_id, business_id);

-- 3. Create worker_invitations table
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

-- RLS for worker_invitations
ALTER TABLE public.worker_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage invitations"
  ON public.worker_invitations FOR ALL
  USING (
    business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can view own invitations"
  ON public.worker_invitations FOR SELECT
  USING (
    email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- 4. Trigger: auto-link pending invitations when a new user signs up
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
