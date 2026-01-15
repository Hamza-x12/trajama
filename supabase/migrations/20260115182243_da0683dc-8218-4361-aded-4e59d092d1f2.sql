-- Drop the lesson-related tables, views, and functions

-- First drop the view that depends on lesson_exercises
DROP VIEW IF EXISTS public.exercise_questions;

-- Drop the function that validates exercise answers
DROP FUNCTION IF EXISTS public.check_exercise_answer(uuid, text);

-- Drop user_progress table (tracks lesson completion)
DROP TABLE IF EXISTS public.user_progress;

-- Drop lesson_exercises table
DROP TABLE IF EXISTS public.lesson_exercises;

-- Drop lessons table
DROP TABLE IF EXISTS public.lessons;