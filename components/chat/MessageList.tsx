/**
 * Scrollable message list component
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MessageBubble } from './MessageBubble';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/types/database';

interface MessageListProps {
  messages: ChatMessage[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MessageList({
  messages,
  onRefresh,
  refreshing = false,
  onLoadMore,
  hasMore = false,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);
  const backgroundColor = useThemeColor({}, 'background');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    return (
      <MessageBubble
        message={item}
        isUser={item.role === 'user'}
      />
    );
  };

  const renderEmpty = () => {
    if (messages.length === 0 && !refreshing) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Start a conversation with your AI care assistant
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          messages.length === 0 && styles.emptyContent,
        ]}
        inverted={false}
        ListEmptyComponent={renderEmpty}
        onEndReached={() => {
          if (hasMore && onLoadMore) {
            onLoadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
  },
});

