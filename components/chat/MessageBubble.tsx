/**
 * Individual message bubble component
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatDateTime, getTimeString } from '@/lib/dateUtils';
import type { ChatMessage } from '@/types/database';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

/**
 * Simple markdown-like formatting for bold and phone numbers
 */
function formatMessageText(text: string, textColor: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Phone number pattern
  const phonePattern = /(\+?[\d\s\-\(\)]{10,})/g;
  
  // Split by phone numbers
  const parts: string[] = [];
  let lastIndex = 0;
  let match;
  
  // Reset regex lastIndex
  phonePattern.lastIndex = 0;
  
  while ((match = phonePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(match[0]); // The phone number
    lastIndex = phonePattern.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  parts.forEach((part, partIndex) => {
    // Check if it's a phone number (odd indices after split)
    const isPhoneNumber = part.match(/^\+?[\d\s\-\(\)]{10,}$/);
    
    if (isPhoneNumber) {
      elements.push(
        <ThemedText
          key={key++}
          style={styles.link}
          onPress={() => Linking.openURL(`tel:${part.replace(/\D/g, '')}`)}
        >
          {part}
        </ThemedText>
      );
      return;
    }

    // Simple bold formatting (**text**)
    const boldPattern = /\*\*(.+?)\*\*/g;
    const boldParts = part.split(boldPattern);

    boldParts.forEach((boldPart, boldIndex) => {
      if (boldIndex % 2 === 1) {
        elements.push(
          <ThemedText key={key++} style={styles.bold}>
            {boldPart}
          </ThemedText>
        );
      } else if (boldPart) {
        elements.push(
          <ThemedText key={key++} style={[styles.messageText, { color: textColor }]}>
            {boldPart}
          </ThemedText>
        );
      }
    });
  });

  return elements.length > 0 ? elements : [
    <ThemedText key={0} style={[styles.messageText, { color: textColor }]}>
      {text}
    </ThemedText>
  ];
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const backgroundColor = useThemeColor(
    {
      light: isUser ? Colors.light.tint : '#F3F4F6',
      dark: isUser ? '#0a7ea4' : '#1F2937',
    },
    'background'
  );

  const textColor = useThemeColor(
    {
      light: isUser ? '#FFFFFF' : Colors.light.text,
      dark: isUser ? '#FFFFFF' : Colors.dark.text,
    },
    'text'
  );

  const timeString = getTimeString(message.created_at);
  const dateString = formatDateTime(message.created_at);

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <ThemedView
        style={[
          styles.bubble,
          {
            backgroundColor,
          },
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <View style={styles.messageContainer}>
          {formatMessageText(message.content, textColor)}
        </View>
        <ThemedText
          style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.7)' : undefined },
          ]}
          lightColor={isUser ? undefined : '#9CA3AF'}
          darkColor={isUser ? undefined : '#6B7280'}
        >
          {timeString}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantBubble: {
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  bold: {
    fontWeight: '600',
  },
  link: {
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
});

