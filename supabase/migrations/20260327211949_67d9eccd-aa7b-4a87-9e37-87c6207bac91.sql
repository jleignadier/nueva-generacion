
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE NULL,
  ADD COLUMN IF NOT EXISTS recurrence_group_id UUID NULL;
