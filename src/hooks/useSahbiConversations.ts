import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  created_at?: string;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_preview: string | null;
  message_count: number;
};

const LOCAL_CONVERSATIONS_KEY = 'sahbi-local-conversations';
const LOCAL_CURRENT_CONVERSATION_KEY = 'sahbi-current-conversation';

export function useSahbiConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) {
      // Load from localStorage for guests
      const stored = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
      if (stored) {
        try {
          setConversations(JSON.parse(stored));
        } catch {
          setConversations([]);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sahbi_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) {
      // Load from localStorage for guests
      const stored = localStorage.getItem(`sahbi-messages-${conversationId}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch {
          setMessages([]);
        }
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sahbi_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data?.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at,
        timestamp: new Date(m.created_at).getTime()
      })) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user]);

  // Create new conversation
  const createConversation = useCallback(async (title?: string): Promise<Conversation | null> => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_preview: null,
      message_count: 0
    };

    if (!user) {
      // Save to localStorage for guests
      const updated = [newConversation, ...conversations];
      setConversations(updated);
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(updated));
      setCurrentConversation(newConversation);
      setMessages([]);
      return newConversation;
    }

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('sahbi_conversations')
        .insert({
          id: newConversation.id,
          user_id: user.id,
          title: newConversation.title
        })
        .select()
        .single();

      if (error) throw error;
      
      const created = data as Conversation;
      setConversations(prev => [created, ...prev]);
      setCurrentConversation(created);
      setMessages([]);
      return created;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, conversations]);

  // Add message to conversation
  const addMessage = useCallback(async (message: Message) => {
    if (!currentConversation) return;

    const messageWithId = {
      ...message,
      id: message.id || crypto.randomUUID(),
      timestamp: message.timestamp || Date.now(),
      created_at: message.created_at || new Date().toISOString()
    };

    // Update local state immediately
    setMessages(prev => {
      // If it's an assistant message being streamed, update the last one
      if (message.role === 'assistant' && prev.length > 0 && prev[prev.length - 1]?.role === 'assistant') {
        return prev.map((m, i) => i === prev.length - 1 ? messageWithId : m);
      }
      return [...prev, messageWithId];
    });

    if (!user) {
      // Save to localStorage for guests
      const stored = localStorage.getItem(`sahbi-messages-${currentConversation.id}`);
      let existingMessages: Message[] = [];
      try {
        existingMessages = stored ? JSON.parse(stored) : [];
      } catch {
        existingMessages = [];
      }
      
      // Update or add message
      const existingIndex = existingMessages.findIndex(m => m.id === messageWithId.id);
      if (existingIndex >= 0) {
        existingMessages[existingIndex] = messageWithId;
      } else {
        existingMessages.push(messageWithId);
      }
      
      localStorage.setItem(`sahbi-messages-${currentConversation.id}`, JSON.stringify(existingMessages));
      
      // Update conversation metadata
      const updatedConv = {
        ...currentConversation,
        updated_at: new Date().toISOString(),
        last_message_preview: message.content.length > 100 ? message.content.slice(0, 100) + '...' : message.content,
        message_count: existingMessages.length
      };
      setCurrentConversation(updatedConv);
      setConversations(prev => 
        prev.map(c => c.id === updatedConv.id ? updatedConv : c)
      );
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(
        conversations.map(c => c.id === updatedConv.id ? updatedConv : c)
      ));
      return;
    }

    // Don't save streaming updates to DB, only final messages
    if (message.role === 'assistant') return;

    try {
      await supabase
        .from('sahbi_messages')
        .insert({
          id: messageWithId.id,
          conversation_id: currentConversation.id,
          role: message.role,
          content: message.content
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, [user, currentConversation, conversations]);

  // Save assistant message (after streaming completes)
  const saveAssistantMessage = useCallback(async (content: string) => {
    if (!currentConversation || !user) return;

    const messageId = crypto.randomUUID();
    
    try {
      await supabase
        .from('sahbi_messages')
        .insert({
          id: messageId,
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: content
        });
    } catch (error) {
      console.error('Error saving assistant message:', error);
    }
  }, [user, currentConversation]);

  // Update conversation title
  const updateTitle = useCallback(async (id: string, title: string) => {
    if (!user) {
      setConversations(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, title } : c);
        localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
      return;
    }

    try {
      await supabase
        .from('sahbi_conversations')
        .update({ title })
        .eq('id', id);

      setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  }, [user, currentConversation]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    if (!user) {
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(updated));
        return updated;
      });
      localStorage.removeItem(`sahbi-messages-${id}`);
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
      return;
    }

    try {
      await supabase
        .from('sahbi_conversations')
        .delete()
        .eq('id', id);

      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  }, [user, currentConversation]);

  // Select conversation
  const selectConversation = useCallback((conversation: Conversation | null) => {
    setCurrentConversation(conversation);
    if (conversation) {
      localStorage.setItem(LOCAL_CURRENT_CONVERSATION_KEY, conversation.id);
      loadMessages(conversation.id);
    } else {
      localStorage.removeItem(LOCAL_CURRENT_CONVERSATION_KEY);
      setMessages([]);
    }
  }, [loadMessages]);

  // Initialize
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Restore last conversation
  useEffect(() => {
    if (!isLoading && conversations.length > 0 && !currentConversation) {
      const lastId = localStorage.getItem(LOCAL_CURRENT_CONVERSATION_KEY);
      const toSelect = conversations.find(c => c.id === lastId) || conversations[0];
      selectConversation(toSelect);
    }
  }, [isLoading, conversations, currentConversation, selectConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    setMessages,
    isLoading,
    isSaving,
    createConversation,
    addMessage,
    saveAssistantMessage,
    updateTitle,
    deleteConversation,
    selectConversation,
    loadConversations
  };
}
