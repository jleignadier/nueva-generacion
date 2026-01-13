-- Add foreign key constraint for event_registrations.user_id -> profiles.id
-- This enables proper joins for participant data
ALTER TABLE public.event_registrations
ADD CONSTRAINT event_registrations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add end_date column for multi-day events
ALTER TABLE public.events
ADD COLUMN end_date date NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.events.end_date IS 'End date for multi-day events. NULL for single-day events.';