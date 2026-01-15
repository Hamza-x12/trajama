-- Add UPDATE policy to sahbi_messages to prevent unauthorized modifications
CREATE POLICY "Users can update messages in their conversations"
ON public.sahbi_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM sahbi_conversations 
  WHERE sahbi_conversations.id = sahbi_messages.conversation_id 
  AND sahbi_conversations.user_id = auth.uid()
));