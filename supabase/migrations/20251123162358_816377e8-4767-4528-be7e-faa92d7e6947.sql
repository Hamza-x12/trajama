-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  category TEXT NOT NULL, -- vocabulary, phrases, grammar
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- Create lesson exercises table
CREATE TABLE IF NOT EXISTS public.lesson_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL, -- translate, match, fill_blank, listen
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- for multiple choice
  darija_audio_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lesson_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises"
  ON public.lesson_exercises FOR SELECT
  USING (true);

-- Create user progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create translation history table
CREATE TABLE IF NOT EXISTS public.translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own translation history"
  ON public.translation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translation history"
  ON public.translation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translation history"
  ON public.translation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert sample lessons
INSERT INTO public.lessons (title, description, level, order_index, category, xp_reward) VALUES
('Greetings & Basics', 'Learn essential Darija greetings and basic phrases', 1, 1, 'vocabulary', 10),
('Family & People', 'Words for family members and describing people', 1, 2, 'vocabulary', 10),
('Food & Drinks', 'Common Moroccan food and beverage vocabulary', 1, 3, 'vocabulary', 15),
('Numbers & Time', 'Count in Darija and tell time', 2, 4, 'vocabulary', 15),
('Common Phrases', 'Everyday expressions used in Morocco', 2, 5, 'phrases', 20),
('At the Market', 'Negotiate and shop like a local', 2, 6, 'phrases', 20);

-- Insert sample exercises for Lesson 1 (Greetings)
INSERT INTO public.lesson_exercises (lesson_id, exercise_type, question, correct_answer, options, order_index) 
SELECT 
  id, 
  'translate',
  'How do you say "Hello" in Darija?',
  'سلام',
  '["سلام", "مرحبا", "صباح الخير", "السلام عليكم"]'::jsonb,
  1
FROM public.lessons WHERE title = 'Greetings & Basics' LIMIT 1;

INSERT INTO public.lesson_exercises (lesson_id, exercise_type, question, correct_answer, options, order_index)
SELECT 
  id,
  'translate',
  'What does "لباس" mean?',
  'Fine / Good',
  '["Fine / Good", "Thank you", "Goodbye", "Please"]'::jsonb,
  2
FROM public.lessons WHERE title = 'Greetings & Basics' LIMIT 1;

INSERT INTO public.lesson_exercises (lesson_id, exercise_type, question, correct_answer, options, order_index)
SELECT 
  id,
  'translate',
  'How do you say "Thank you" in Darija?',
  'شكرا',
  '["شكرا", "عفاك", "بسلامة", "الله يعطيك الصحة"]'::jsonb,
  3
FROM public.lessons WHERE title = 'Greetings & Basics' LIMIT 1;