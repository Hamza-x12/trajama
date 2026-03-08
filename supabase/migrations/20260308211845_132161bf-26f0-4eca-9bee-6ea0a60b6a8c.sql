
-- Create challenge_scores table
CREATE TABLE public.challenge_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  challenge_type text NOT NULL,
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenge_scores ENABLE ROW LEVEL SECURITY;

-- Users can insert their own scores
CREATE POLICY "Users can insert their own scores"
ON public.challenge_scores FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own scores
CREATE POLICY "Users can view their own scores"
ON public.challenge_scores FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Everyone authenticated can read leaderboard (all scores)
CREATE POLICY "Authenticated users can read all scores for leaderboard"
ON public.challenge_scores FOR SELECT TO authenticated
USING (true);

-- Create leaderboard function
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(display_name text, avatar_url text, total_score bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.display_name, 'Anonymous') as display_name,
    p.avatar_url,
    SUM(cs.score)::bigint as total_score
  FROM public.challenge_scores cs
  JOIN public.profiles p ON p.id = cs.user_id
  GROUP BY p.id, p.display_name, p.avatar_url
  ORDER BY total_score DESC
  LIMIT 10;
$$;
