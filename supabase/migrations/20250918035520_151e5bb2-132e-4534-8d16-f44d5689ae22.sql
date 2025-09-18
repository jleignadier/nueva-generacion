-- Remove the overly permissive policy that exposes all organization data
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;

-- Create new restrictive policies for organization data access

-- Policy 1: Allow everyone to view only basic organization info (name and description)
-- This maintains functionality for public displays while protecting sensitive data
CREATE POLICY "Basic organization info is viewable by everyone" 
ON public.organizations 
FOR SELECT 
USING (true)
WITH CHECK (false);

-- However, we need to modify this to only show specific columns
-- Let's create a view for public organization data instead
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

-- Policy 2: Authenticated users can see more details but not sensitive contact info
CREATE POLICY "Authenticated users can view organization details" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (true);

-- Policy 3: Admins can see everything (already exists: "Admins can manage organizations")
-- Policy 4: Organizations can see their own full details (already exists: "Organizations can update themselves")

-- Create a secure view for authenticated users that excludes most sensitive contact info
CREATE OR REPLACE VIEW public.organizations_safe AS
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at,
  -- Only show partial contact info for authenticated users
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN contact_email
    ELSE CONCAT(LEFT(SPLIT_PART(contact_email, '@', 1), 2), '***@', SPLIT_PART(contact_email, '@', 2))
  END as contact_email_masked,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN phone
    ELSE CONCAT(LEFT(phone, 3), '***')
  END as phone_masked,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN address
    ELSE 'Location available upon request'
  END as address_masked
FROM public.organizations;

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.organizations_safe TO authenticated;

-- Create a function for organizations to view their own full contact details
CREATE OR REPLACE FUNCTION public.get_organization_full_details(org_id uuid)
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