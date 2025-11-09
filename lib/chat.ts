/**
 * Chat message CRUD operations
 */

import { supabase } from './supabase';
import type { ChatMessage } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatError {
  message: string;
  code?: string;
}

/**
 * Get chat history for a patient
 */
export async function getChatHistory(
  patientId: string,
  roadmapId?: string | null,
  limit?: number
): Promise<{
  messages: ChatMessage[];
  error: ChatError | null;
}> {
  try {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (roadmapId) {
      query = query.eq('roadmap_id', roadmapId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return {
        messages: [],
        error: { message: error.message, code: error.code },
      };
    }

    return { messages: (data || []) as ChatMessage[], error: null };
  } catch (error: any) {
    return {
      messages: [],
      error: { message: error.message || 'Failed to fetch chat history' },
    };
  }
}

/**
 * Save a chat message
 */
export async function saveMessage(
  patientId: string,
  role: 'user' | 'assistant',
  content: string,
  roadmapId?: string | null,
  stepId?: string | null
): Promise<{
  message: ChatMessage | null;
  error: ChatError | null;
}> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        patient_id: patientId,
        role,
        content,
        roadmap_id: roadmapId || null,
        step_id: stepId || null,
      })
      .select()
      .single();

    if (error) {
      return {
        message: null,
        error: { message: error.message, code: error.code },
      };
    }

    return { message: data as ChatMessage, error: null };
  } catch (error: any) {
    return {
      message: null,
      error: { message: error.message || 'Failed to save message' },
    };
  }
}

/**
 * Subscribe to chat updates (real-time)
 */
export function subscribeToChatUpdates(
  patientId: string,
  callback: (message: ChatMessage) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`chat:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as ChatMessage);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from chat updates
 */
export function unsubscribeFromChatUpdates(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

/**
 * Delete a chat message
 */
export async function deleteMessage(messageId: string): Promise<{
  error: ChatError | null;
}> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return {
        error: { message: error.message, code: error.code },
      };
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Failed to delete message' },
    };
  }
}

/**
 * Clear all chat messages for a patient
 */
export async function clearChatHistory(patientId: string): Promise<{
  error: ChatError | null;
}> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('patient_id', patientId);

    if (error) {
      return {
        error: { message: error.message, code: error.code },
      };
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: { message: error.message || 'Failed to clear chat history' },
    };
  }
}

