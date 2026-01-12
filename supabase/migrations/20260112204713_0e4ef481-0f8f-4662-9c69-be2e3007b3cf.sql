-- Create table for Sahbi conversation threads
CREATE TABLE public.sahbi_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_message_preview TEXT,
    message_count INTEGER NOT NULL DEFAULT 0
);

-- Create table for Sahbi messages within conversations
CREATE TABLE public.sahbi_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.sahbi_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sahbi_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sahbi_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.sahbi_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.sahbi_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.sahbi_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.sahbi_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.sahbi_messages FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.sahbi_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations"
ON public.sahbi_messages FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.sahbi_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in their conversations"
ON public.sahbi_messages FOR DELETE
USING (EXISTS (
    SELECT 1 FROM public.sahbi_conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
));

-- Create view for exercises without exposing correct answers (security fix)
CREATE VIEW public.exercise_questions AS
SELECT id, lesson_id, exercise_type, question, options, darija_audio_url, order_index, created_at
FROM lesson_exercises;

-- Create secure function to check answers
CREATE OR REPLACE FUNCTION public.check_exercise_answer(
    exercise_id UUID,
    user_answer TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM lesson_exercises
        WHERE id = exercise_id AND LOWER(TRIM(correct_answer)) = LOWER(TRIM(user_answer))
    );
END;
$$;

-- Trigger to update conversation metadata
CREATE OR REPLACE FUNCTION public.update_conversation_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.sahbi_conversations
    SET 
        updated_at = now(),
        last_message_preview = CASE 
            WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
            ELSE NEW.content
        END,
        message_count = (
            SELECT COUNT(*) FROM public.sahbi_messages 
            WHERE conversation_id = NEW.conversation_id
        )
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.sahbi_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_metadata();

-- Indexes for performance
CREATE INDEX idx_sahbi_conversations_user_id ON public.sahbi_conversations(user_id);
CREATE INDEX idx_sahbi_conversations_updated_at ON public.sahbi_conversations(updated_at DESC);
CREATE INDEX idx_sahbi_messages_conversation_id ON public.sahbi_messages(conversation_id);
CREATE INDEX idx_sahbi_messages_created_at ON public.sahbi_messages(created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.sahbi_messages;