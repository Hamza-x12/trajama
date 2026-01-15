-- Add explicit UPDATE and DELETE deny policies for contact_submissions
CREATE POLICY "No update access to contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (false);

CREATE POLICY "No delete access to contact submissions"
ON public.contact_submissions
FOR DELETE
USING (false);