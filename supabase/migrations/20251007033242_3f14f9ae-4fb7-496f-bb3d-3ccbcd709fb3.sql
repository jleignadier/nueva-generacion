-- Add foreign key constraints with CASCADE delete for event-related tables
-- This ensures when an event is deleted, related records are also deleted

-- First, add foreign key for event_attendance if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'event_attendance_event_id_fkey'
  ) THEN
    ALTER TABLE public.event_attendance
    ADD CONSTRAINT event_attendance_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for donations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_event_id_fkey'
  ) THEN
    ALTER TABLE public.donations
    ADD CONSTRAINT donations_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id)
    ON DELETE CASCADE;
  END IF;
END $$;