/**
 * Info card component for displaying grouped information
 */

import { StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadmapColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { ReactNode } from 'react';

interface InfoCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
}

export function InfoCard({ title, icon, children, style }: InfoCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? RoadmapColors.dark.stepBackground
            : RoadmapColors.light.stepBackground,
          borderColor: isDark
            ? RoadmapColors.dark.stepBorder
            : RoadmapColors.light.stepBorder,
        },
        Shadows.md,
        style,
      ]}
    >
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title && (
            <ThemedText style={styles.title}>{title}</ThemedText>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    // Icon container
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  content: {
    gap: Spacing.sm,
  },
});

