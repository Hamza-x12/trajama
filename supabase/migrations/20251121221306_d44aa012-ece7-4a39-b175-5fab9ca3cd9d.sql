-- Add inquiry_type column to contact_submissions table
ALTER TABLE public.contact_submissions 
ADD COLUMN inquiry_type TEXT NOT NULL DEFAULT 'question' CHECK (inquiry_type IN ('question', 'suggestion', 'problem'));