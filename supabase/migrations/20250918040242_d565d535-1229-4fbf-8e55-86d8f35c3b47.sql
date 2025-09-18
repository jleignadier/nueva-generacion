-- Add RLS to organizations_public view to fix security issue
ALTER TABLE public.organizations_public ENABLE ROW LEVEL SECURITY;

-- Create policies for the organizations_public view
CREATE POLICY "Anonymous users can view public organization data" 
ON public.organizations_public 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Authenticated users can view public organization data" 
ON public.organizations_public 
FOR SELECT 
TO authenticated
USING (true);