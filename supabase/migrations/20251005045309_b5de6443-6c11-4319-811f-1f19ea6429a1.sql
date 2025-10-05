-- Fix remaining security issues with proper view configuration

-- 1. Drop the incorrectly configured policies on base tables
DROP POLICY IF EXISTS "Public can view organizations_public view" ON organizations;
DROP POLICY IF EXISTS "Public can view events_public view" ON events;

-- 2. The views with security_invoker=on will use the RLS policies of the underlying tables
-- So we need to keep restricted policies on the base tables, but allow querying through views

-- 3. For organizations table - only allow authenticated users (prevents scraping)
-- Contact info is already protected by the view which excludes sensitive columns
-- The view (organizations_public) only shows: id, name, description, logo_url, created_at

-- 4. For events table - keep it restricted to authenticated users
-- The view (events_public) already excludes created_by field for privacy

-- No additional policies needed - the existing "Authenticated users can view basic org info" 
-- policy on organizations is correct since:
-- - It requires authentication (prevents scraping)
-- - The view filters out sensitive contact info
-- - Only id, name, description, logo_url, created_at are exposed through the view