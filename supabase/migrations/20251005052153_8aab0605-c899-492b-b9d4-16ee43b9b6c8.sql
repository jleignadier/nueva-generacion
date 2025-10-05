-- Allow authenticated users to view events
CREATE POLICY "Authenticated users can view events"
ON public.events
FOR SELECT
TO authenticated
USING (true);