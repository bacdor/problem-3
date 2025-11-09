/**
 * React hook for chat functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as chatService from '@/lib/chat';
import * as aiService from '@/lib/aiService';
import type { ChatMessage } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseChatResult {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: chatService.ChatError | null;
  sendMessage: (content: string, roadmapId?: string | null) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export function useChat(roadmapId?: string | null): UseChatResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<chatService.ChatError | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await chatService.getChatHistory(user.id, roadmapId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setMessages(result.messages);
      setError(null);
    }
    
    setLoading(false);
  }, [user, roadmapId]);

  const sendMessage = useCallback(
    async (content: string, messageRoadmapId?: string | null) => {
      if (!user || !content.trim() || sending) return;

      const activeRoadmapId = messageRoadmapId || roadmapId;
      setSending(true);
      setError(null);

      try {
        // Save user message
        const userMessageResult = await chatService.saveMessage(
          user.id,
          'user',
          content,
          activeRoadmapId,
          null
        );

        if (userMessageResult.error) {
          setError(userMessageResult.error);
          setSending(false);
          return;
        }

        if (userMessageResult.message) {
          setMessages((prev) => [...prev, userMessageResult.message!]);
        }

        // Generate AI response
        const aiResponseResult = await aiService.generateAIResponse(
          content,
          user.id,
          activeRoadmapId
        );

        if (aiResponseResult.error) {
          setError(aiResponseResult.error);
          setSending(false);
          return;
        }

        if (aiResponseResult.message) {
          setMessages((prev) => [...prev, aiResponseResult.message!]);
        }
      } catch (err: any) {
        setError({
          message: err.message || 'Failed to send message',
        });
      } finally {
        setSending(false);
      }
    },
    [user, roadmapId, sending]
  );

  const clearHistory = useCallback(async () => {
    if (!user) return;

    const result = await chatService.clearChatHistory(user.id);
    if (result.error) {
      setError(result.error);
    } else {
      setMessages([]);
    }
  }, [user]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Clean up previous subscription
    if (channelRef.current) {
      chatService.unsubscribeFromChatUpdates(channelRef.current);
    }

    // Subscribe to updates
    const channel = chatService.subscribeToChatUpdates(user.id, (newMessage) => {
      // Only add if it matches the current roadmap filter
      if (!roadmapId || newMessage.roadmap_id === roadmapId) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        chatService.unsubscribeFromChatUpdates(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, roadmapId]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    clearHistory,
  };
}

