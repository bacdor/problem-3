/**
 * Quick suggestion chips/buttons component
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius } from '@/constants/theme';

interface QuickSuggestion {
  id: string;
  text: string;
}

interface QuickSuggestionsProps {
  suggestions: QuickSuggestion[];
  onSelect: (suggestion: QuickSuggestion) => void;
  visible?: boolean;
}

const DEFAULT_SUGGESTIONS: QuickSuggestion[] = [
  { id: 'next-step', text: "What's my next step?" },
  { id: 'next-appointment', text: 'When is my next appointment?' },
  { id: 'prep-instructions', text: 'Do I need to prepare for anything?' },
  { id: 'overdue', text: 'Do I have any overdue steps?' },
];

export function QuickSuggestions({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
  visible = true,
}: QuickSuggestionsProps) {
  const backgroundColor = useThemeColor(
    { light: '#F3F4F6', dark: '#1F2937' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.chip,
              {
                borderColor: tintColor,
              },
            ]}
            onPress={() => onSelect(suggestion)}
          >
            <ThemedText
              style={styles.chipText}
              lightColor={tintColor}
              darkColor={tintColor}
            >
              {suggestion.text}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

