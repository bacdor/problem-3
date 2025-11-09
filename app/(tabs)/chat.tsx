/**
 * Main chat screen with AI guidance
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Alert as RNAlert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { AIThinkingIndicator } from '@/components/chat/AIThinkingIndicator';
import { AlertBanner } from '@/components/chat/AlertBanner';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { generateProactiveAlerts } from '@/lib/alertService';
import { generateWelcomeMessage } from '@/lib/aiService';
import { useRoadmaps } from '@/hooks/useRoadmap';
import type { Alert } from '@/lib/alertService';
import { Spacing } from '@/constants/theme';

export default function ChatScreen() {
  const { user } = useAuth();
  const { roadmaps } = useRoadmaps();
  const activeRoadmap = roadmaps.find((r) => r.status === 'active');
  const { messages, loading, sending, error, sendMessage } = useChat(
    activeRoadmap?.id
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Load alerts
  useEffect(() => {
    if (!user) return;

    const loadAlerts = async () => {
      const result = await generateProactiveAlerts(user.id);
      if (!result.error && result.alerts) {
        setAlerts(result.alerts);
      }
    };

    loadAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Generate welcome message on first load
  useEffect(() => {
    if (!user || messages.length > 0 || loading) return;

    const showWelcome = async () => {
      const result = await generateWelcomeMessage(user.id);
      if (result.error) {
        console.error('Failed to generate welcome message:', result.error);
      }
    };

    showWelcome();
  }, [user, messages.length, loading]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setShowSuggestions(false);
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: { id: string; text: string }) => {
      handleSendMessage(suggestion.text);
    },
    [handleSendMessage]
  );

  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  }, []);

  const handleAlertAction = useCallback((alert: Alert) => {
    // Navigate to step details if stepId is present
    if (alert.stepId) {
      // TODO: Navigate to step detail modal
      RNAlert.alert('Step Details', 'Navigate to step details');
    }
  }, []);

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  );

  if (loading && messages.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText type="title" style={styles.title}>
            AI Guidance
          </ThemedText>
          <ThemedText style={styles.subtitle}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.container}>
        {/* Alert Banners */}
        {visibleAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {visibleAlerts.map((alert) => (
              <AlertBanner
                key={alert.id}
                alert={alert}
                onDismiss={handleDismissAlert}
                onAction={handleAlertAction}
              />
            ))}
          </View>
        )}

        {/* Quick Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <QuickSuggestions
            suggestions={[
              { id: 'next-step', text: "What's my next step?" },
              { id: 'next-appointment', text: 'When is my next appointment?' },
              {
                id: 'prep-instructions',
                text: 'Do I need to prepare for anything?',
              },
            ]}
            onSelect={handleSuggestionSelect}
          />
        )}

        {/* Message List */}
        <MessageList messages={messages} />

        {/* AI Thinking Indicator */}
        {sending && <AIThinkingIndicator />}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              {error.message || 'An error occurred'}
            </ThemedText>
          </View>
        )}

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={sending}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  alertsContainer: {
    paddingTop: Spacing.sm,
  },
  errorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
});
