/**
 * React hook for loading chat history with pagination
 */

import { useAuth } from "@/contexts/AuthContext";
import * as chatService from "@/lib/chat";
import type { ChatMessage } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseChatHistoryResult {
  messages: ChatMessage[];
  loading: boolean;
  error: chatService.ChatError | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

const MESSAGES_PER_PAGE = 50;

export function useChatHistory(
  roadmapId?: string | null,
): UseChatHistoryResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<chatService.ChatError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(
    async (limit?: number) => {
      if (!user) {
        setMessages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await chatService.getChatHistory(
        user.id,
        roadmapId,
        limit,
      );

      if (result.error) {
        setError(result.error);
        setMessages([]);
      } else {
        setMessages(result.messages);
        setHasMore(result.messages.length === (limit || MESSAGES_PER_PAGE));
      }

      setLoading(false);
    },
    [user, roadmapId],
  );

  const loadMore = useCallback(async () => {
    if (!user || loading || !hasMore) return;

    const currentCount = messages.length;
    const result = await chatService.getChatHistory(
      user.id,
      roadmapId,
      currentCount + MESSAGES_PER_PAGE,
    );

    if (!result.error && result.messages) {
      setMessages(result.messages);
      setHasMore(result.messages.length === currentCount + MESSAGES_PER_PAGE);
    }
  }, [user, roadmapId, messages.length, loading, hasMore]);

  useEffect(() => {
    fetchMessages(MESSAGES_PER_PAGE);
  }, [fetchMessages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Clean up previous subscription
    if (channelRef.current) {
      chatService.unsubscribeFromChatUpdates(channelRef.current);
    }

    // Subscribe to updates
    const channel = chatService.subscribeToChatUpdates(
      user.id,
      (newMessage) => {
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
      },
    );

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
    error,
    hasMore,
    loadMore,
    refetch: () => fetchMessages(MESSAGES_PER_PAGE),
  };
}
