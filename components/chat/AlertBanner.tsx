/**
 * Proactive alert banner component
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Alert } from '@/lib/alertService';
import { Spacing, BorderRadius } from '@/constants/theme';

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: (alertId: string) => void;
  onAction?: (alert: Alert) => void;
}

export function AlertBanner({ alert, onDismiss, onAction }: AlertBannerProps) {
  const getUrgencyColor = () => {
    switch (alert.urgency) {
      case 'high':
        return { light: '#FEE2E2', dark: '#7F1D1D' }; // Red
      case 'medium':
        return { light: '#FEF3C7', dark: '#78350F' }; // Yellow
      case 'low':
        return { light: '#DBEAFE', dark: '#1E3A8A' }; // Blue
      default:
        return { light: '#F3F4F6', dark: '#374151' };
    }
  };

  const getUrgencyIcon = () => {
    switch (alert.urgency) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'time';
      case 'low':
        return 'information-circle';
      default:
        return 'information-circle-outline';
    }
  };

  const colors = getUrgencyColor();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colors.light,
        },
      ]}
      lightColor={colors.light}
      darkColor={colors.dark}
    >
      <View style={styles.content}>
        <Ionicons
          name={getUrgencyIcon()}
          size={20}
          color={alert.urgency === 'high' ? '#DC2626' : '#F59E0B'}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{alert.title}</ThemedText>
          <ThemedText style={styles.message}>{alert.message}</ThemedText>
          {alert.actionLabel && onAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onAction(alert)}
            >
              <ThemedText style={styles.actionText}>
                {alert.actionLabel}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => onDismiss(alert.id)}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  actionButton: {
    marginTop: Spacing.xs,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

