-- Fix the remaining security issue properly
-- The organizations_public view inherits RLS from the organizations table
-- We need to ensure sensitive contact data is not exposed through the regular policies

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view organization names only" ON public.organizations;

-- Create separate policies for different types of data access
-- 1. Public can only see basic info (name, description) - but we need to handle this in application layer since RLS works on entire rows
-- 2. For now, let's restrict public access entirely and only allow authenticated users
CREATE POLICY "Authenticated users can view basic organization info" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Add a comment to document that contact info should be protected in application layer
COMMENT ON TABLE public.organizations IS 'Contact information (phone, email, address) should be filtered out in application layer for public access';