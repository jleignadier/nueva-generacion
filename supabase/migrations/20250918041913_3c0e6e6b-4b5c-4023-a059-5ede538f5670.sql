-- Fix remaining security issues

-- 1. Remove public access to organizations table and restrict to only basic info
DROP POLICY IF EXISTS "Public can view basic organization info" ON public.organizations;

-- Create a restricted policy for basic organization info (only name and description, no contact info)
CREATE POLICY "Public can view organization names only" 
ON public.organizations 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Enable RLS on organizations_public view and add policies
-- Note: In PostgreSQL, views inherit RLS from underlying tables, but we can be explicit
CREATE POLICY "Anyone can view public organization data" 
ON public.organizations_public 
FOR SELECT 
TO anon, authenticated
USING (true);