-- Drop the security definer view and recreate without security definer
DROP VIEW IF EXISTS public.exercise_questions;

-- Create view with SECURITY INVOKER (default, safe)
CREATE VIEW public.exercise_questions 
WITH (security_invoker = true)
AS
SELECT id, lesson_id, exercise_type, question, options, darija_audio_url, order_index, created_at
FROM lesson_exercises;