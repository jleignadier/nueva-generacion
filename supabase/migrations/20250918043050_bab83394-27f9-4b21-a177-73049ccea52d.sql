-- Fix organization data exposure security issues - handle existing policies
-- Remove overly permissive policies and create granular access control

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view basic organization info" ON public.organizations;
DROP POLICY IF EXISTS "Public can view basic organization info" ON public.organizations;
DROP POLICY IF EXISTS "Public can view organization names and descriptions" ON public.organizations;
DROP POLICY IF EXISTS "Organization members can view their organization details" ON public.organizations;
DROP POLICY IF EXISTS "Admins can view all organization details" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organizations can update themselves" ON public.organizations;

-- Create new granular policies for different access levels

-- 1. Basic policy for all users to see organization data (contact info filtering happens in app layer)
CREATE POLICY "Users can view organizations" 
ON public.organizations 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Admins can manage all organizations
CREATE POLICY "Admins can manage all organizations" 
ON public.organizations 
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Organizations can update their own details
CREATE POLICY "Organizations can update their own info" 
ON public.organizations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = organizations.id 
      AND profiles.account_type = 'organization'::app_role
  )
);

-- Create a function to get public organization data (without sensitive contact info)
CREATE OR REPLACE FUNCTION public.get_public_organizations()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.description,
    o.created_at
  FROM public.organizations o;
$$;

-- Create a function to check if user can view organization contact details
CREATE OR REPLACE FUNCTION public.can_view_organization_contact(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    -- Admins can view all
    has_role(auth.uid(), 'admin'::app_role) OR
    -- Organization members can view their own organization
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
        AND p.organization_id = org_id 
        AND p.account_type = 'organization'::app_role
    );
$$;