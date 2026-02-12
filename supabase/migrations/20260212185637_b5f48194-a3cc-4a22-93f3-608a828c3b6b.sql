-- Add explicit UPDATE policy for translation_history to maintain clear security posture
CREATE POLICY "Users can update their own translation history"
ON public.translation_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);