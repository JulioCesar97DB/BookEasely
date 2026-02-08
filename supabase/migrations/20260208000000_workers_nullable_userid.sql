-- Allow external workers without linked user accounts
ALTER TABLE public.workers ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing unique constraint and recreate as partial unique index
-- (only enforce uniqueness when user_id IS NOT NULL)
ALTER TABLE public.workers DROP CONSTRAINT IF EXISTS workers_user_id_business_id_key;
CREATE UNIQUE INDEX workers_user_id_business_id_unique
  ON public.workers (user_id, business_id)
  WHERE user_id IS NOT NULL;
