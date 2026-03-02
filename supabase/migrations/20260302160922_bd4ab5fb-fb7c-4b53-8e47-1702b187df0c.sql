
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.event_registrations;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- Create a secure function to get event participants for display (avatars + count)
CREATE OR REPLACE FUNCTION public.get_event_participants(p_event_id uuid)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  account_type text,
  organization_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id AS user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.account_type::text,
    er.organization_id
  FROM public.event_registrations er
  JOIN public.profiles p ON er.user_id = p.id
  WHERE er.event_id = p_event_id
  ORDER BY er.registered_at ASC;
$$;

-- Create a function to get registration count only (lightweight)
CREATE OR REPLACE FUNCTION public.get_event_registration_count(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.event_registrations
  WHERE event_id = p_event_id;
$$;
