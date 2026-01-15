-- Add restrictive SELECT policy to contact_submissions
-- This is a write-only table - no one should be able to read submissions via the API
CREATE POLICY "No public read access to contact submissions"
ON public.contact_submissions
FOR SELECT
USING (false);