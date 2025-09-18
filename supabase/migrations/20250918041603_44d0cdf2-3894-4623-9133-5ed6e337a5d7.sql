-- Ensure the organizations_public view uses security_invoker
DROP VIEW IF EXISTS public.organizations_public;

-- Recreate with explicit security_invoker setting for Postgres 15+
CREATE VIEW public.organizations_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  description,
  created_at
FROM public.organizations;