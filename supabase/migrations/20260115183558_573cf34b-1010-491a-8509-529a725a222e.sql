-- Ensure RLS is enabled on translation_history (should already be, but confirming)
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on contact_submissions (should already be, but confirming)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;