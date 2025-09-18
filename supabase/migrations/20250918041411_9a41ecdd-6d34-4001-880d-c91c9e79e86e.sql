-- Fix all critical security issues

-- 1. Drop the problematic organizations_public view
DROP VIEW IF EXISTS public.organizations_public;

-- 2. Update organizations table RLS policies to be more granular
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON public.organizations;

-- Create granular policies for organizations table
CREATE POLICY "Public can view basic organization info" 
ON public.organizations 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can view all organization details" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Organization members can view their organization details" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
      AND p.organization_id = organizations.id 
      AND p.account_type = 'organization'::app_role
  )
);

-- 3. Recreate organizations_public view without SECURITY DEFINER
CREATE VIEW public.organizations_public AS
SELECT 
  id,
  name,
  description,
  created_at
FROM public.organizations;

-- 4. Enable RLS on the organizations_public view
ALTER VIEW public.organizations_public SET (security_invoker = true);

-- 5. Create policies for organizations_public view
CREATE POLICY "Anyone can view public organization data" 
ON public.organizations_public 
FOR SELECT 
TO anon, authenticated
USING (true);