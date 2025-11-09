/**
 * OpenAI client configuration and utilities
 */

import OpenAI from 'openai';
import { env } from './env';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: env.openaiApiKey,
  dangerouslyAllowBrowser: true, // Required for Expo/React Native
});

export interface ChatCompletionError {
  message: string;
  code?: string;
  type?: string;
}

/**
 * Generate chat completion using OpenAI API
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{
  content: string | null;
  error: ChatCompletionError | null;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content || null;

    if (!content) {
      return {
        content: null,
        error: {
          message: 'No response content from OpenAI',
          type: 'empty_response',
        },
      };
    }

    return { content, error: null };
  } catch (error: any) {
    // Handle different types of errors
    if (error.status === 429) {
      return {
        content: null,
        error: {
          message: 'Rate limit exceeded. Please try again in a moment.',
          code: 'rate_limit',
          type: 'rate_limit',
        },
      };
    }

    if (error.status === 401) {
      return {
        content: null,
        error: {
          message: 'Invalid API key. Please check your OpenAI API key configuration.',
          code: 'invalid_api_key',
          type: 'authentication',
        },
      };
    }

    if (error.message) {
      return {
        content: null,
        error: {
          message: error.message,
          code: error.code,
          type: error.type || 'unknown',
        },
      };
    }

    return {
      content: null,
      error: {
        message: 'Failed to generate AI response. Please try again.',
        type: 'unknown',
      },
    };
  }
}

