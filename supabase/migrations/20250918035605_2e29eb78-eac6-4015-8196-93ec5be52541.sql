-- Remove the overly permissive policy that exposes all organization data
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;

-- Create new restrictive policies for organization data access

-- Policy 1: Only authenticated users can view organizations (removes public access)
CREATE POLICY "Authenticated users can view organizations" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (true);

-- Create a public view that only exposes non-sensitive organization data
CREATE OR REPLACE VIEW public.organizations_public AS
SELECT 
  id,
  name,
  description,
  created_at
FROM public.organizations;

-- Grant access to the public view
GRANT SELECT ON public.organizations_public TO anon;
GRANT SELECT ON public.organizations_public TO authenticated;

-- Create a secure function for getting organization contact details
-- Only admins and the organization itself can access full contact info
CREATE OR REPLACE FUNCTION public.get_organization_contact(org_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  contact_email text,
  phone text,
  address text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.name,
    o.description,
    o.contact_email,
    o.phone,
    o.address,
    o.created_at,
    o.updated_at
  FROM public.organizations o
  WHERE o.id = org_id
    AND (
      has_role(auth.uid(), 'admin'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
          AND p.organization_id = org_id 
          AND p.account_type = 'organization'::app_role
      )
    );
$$;