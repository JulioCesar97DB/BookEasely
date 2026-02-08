-- Phase 2: Minor schema updates
-- 1. Add updated_at to services table
-- 2. Add trigger for auto-updating services.updated_at
-- 3. Add unique constraint on worker_availability(worker_id, day_of_week)

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.worker_availability
  ADD CONSTRAINT worker_availability_worker_day_unique UNIQUE (worker_id, day_of_week);
