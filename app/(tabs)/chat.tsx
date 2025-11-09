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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { AIThinkingIndicator } from '@/components/chat/AIThinkingIndicator';
import { AlertBanner } from '@/components/chat/AlertBanner';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { RoadmapSelector } from '@/components/chat/RoadmapSelector';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { generateProactiveAlerts } from '@/lib/alertService';
import { generateWelcomeMessage } from '@/lib/aiService';
import { useRoadmaps } from '@/hooks/useRoadmap';
import type { Alert } from '@/lib/alertService';
import { Spacing, Colors, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChatScreen() {
  const { user } = useAuth();
  const { roadmaps } = useRoadmaps();
  const activeRoadmap = roadmaps.find((r) => r.status === 'active');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(
    activeRoadmap?.id || null
  );
  const { messages, loading, sending, error, sendMessage, clearHistory } = useChat(
    selectedRoadmapId
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );
  const [showSuggestions, setShowSuggestions] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Update selected roadmap when active roadmap changes
  useEffect(() => {
    if (activeRoadmap && !selectedRoadmapId) {
      setSelectedRoadmapId(activeRoadmap.id);
    }
  }, [activeRoadmap, selectedRoadmapId]);

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

  // Generate welcome message on first load or when roadmap changes
  useEffect(() => {
    if (!user || messages.length > 0 || loading) return;

    const showWelcome = async () => {
      const result = await generateWelcomeMessage(user.id, selectedRoadmapId);
      if (result.error) {
        console.error('Failed to generate welcome message:', result.error);
      }
    };

    showWelcome();
  }, [user, messages.length, loading, selectedRoadmapId]);

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

  const handleStartOver = useCallback(() => {
    RNAlert.alert(
      'Start Over',
      'Are you sure you want to delete all chat messages? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Over',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setShowSuggestions(true);
            // Regenerate welcome message after clearing
            if (user) {
              const result = await generateWelcomeMessage(user.id, selectedRoadmapId);
              if (result.error) {
                console.error('Failed to generate welcome message:', result.error);
              }
            }
          },
        },
      ]
    );
  }, [clearHistory, user, selectedRoadmapId]);

  const handleRoadmapSelect = useCallback((roadmapId: string | null) => {
    setSelectedRoadmapId(roadmapId);
    setShowSuggestions(true);
  }, []);

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  );

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.container}>
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.subtitle}>Loading...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView
          style={[
            styles.header,
            {
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
              borderBottomColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
            },
          ]}
        >
          <View style={styles.headerLeft}>
            {roadmaps.length > 0 && (
              <RoadmapSelector
                roadmaps={roadmaps}
                selectedRoadmapId={selectedRoadmapId}
                onSelect={handleRoadmapSelect}
              />
            )}
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.startOverButton}
              onPress={handleStartOver}
              accessibilityRole="button"
              accessibilityLabel="Start over conversation"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={isDark ? Colors.dark.tint : Colors.light.tint}
              />
              <ThemedText style={styles.startOverText}>Start Over</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

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
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    ...Shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  startOverText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Spacing.xs,
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
