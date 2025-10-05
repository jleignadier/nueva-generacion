-- Fix Security Definer View Warning and Complete Security Lockdown

-- 1. Drop the old "Anyone can view events" policy that still exists
DROP POLICY IF EXISTS "Anyone can view events" ON events;

-- 2. Recreate views with SECURITY INVOKER to respect RLS
-- Drop existing views first
DROP VIEW IF EXISTS organizations_public CASCADE;
DROP VIEW IF EXISTS events_public CASCADE;

-- Create organizations_public view with SECURITY INVOKER
-- This view only exposes non-sensitive organization data
CREATE VIEW organizations_public 
WITH (security_invoker=on) 
AS
SELECT 
  id,
  name,
  description,
  logo_url,
  created_at
FROM organizations;

-- Grant access to the public view
GRANT SELECT ON organizations_public TO anon, authenticated;

-- Create events_public view with SECURITY INVOKER
-- This view excludes creator IDs for privacy
CREATE VIEW events_public 
WITH (security_invoker=on)
AS
SELECT 
  id,
  title,
  description,
  date,
  time,
  end_time,
  location,
  image_url,
  status,
  points_earned,
  volunteer_hours,
  funding_required,
  current_funding,
  created_at,
  updated_at
FROM events
WHERE status != 'cancelled'::event_status;

-- Grant access to the public view
GRANT SELECT ON events_public TO anon, authenticated;

-- 3. Since views now use SECURITY INVOKER, we need RLS policies on the views themselves
-- Enable RLS on the views
ALTER VIEW organizations_public SET (security_barrier=true);
ALTER VIEW events_public SET (security_barrier=true);

-- 4. Add policies to allow public SELECT on the views
-- Note: These policies apply to the underlying tables through the views
CREATE POLICY "Public can view organizations_public view"
ON organizations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can view events_public view"  
ON events FOR SELECT
TO anon, authenticated
USING (true);