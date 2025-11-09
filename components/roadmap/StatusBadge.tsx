/**
 * Status badge component for displaying clinic approval and data received status
 */

import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { RoadmapColors, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type StatusBadgeType = 'approved' | 'pending' | 'rejected' | 'received' | 'not_received';

interface StatusBadgeProps {
  type: StatusBadgeType;
  label: string;
  showIcon?: boolean;
}

export function StatusBadge({ type, label, showIcon = true }: StatusBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusConfig = () => {
    switch (type) {
      case 'approved':
      case 'received':
        return {
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          borderColor: isDark ? '#34D399' : '#10B981',
          textColor: isDark ? '#34D399' : '#10B981',
          icon: 'checkmark-circle' as const,
        };
      case 'pending':
        return {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
          borderColor: isDark ? '#FBBF24' : '#F59E0B',
          textColor: isDark ? '#FBBF24' : '#F59E0B',
          icon: 'time-outline' as const,
        };
      case 'rejected':
      case 'not_received':
        return {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: isDark ? '#F87171' : '#EF4444',
          textColor: isDark ? '#F87171' : '#EF4444',
          icon: 'close-circle' as const,
        };
      default:
        return {
          backgroundColor: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)',
          borderColor: isDark ? '#9CA3AF' : '#9CA3AF',
          textColor: isDark ? '#9CA3AF' : '#6B7280',
          icon: 'help-circle-outline' as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={16}
          color={config.textColor}
          style={styles.icon}
        />
      )}
      <ThemedText
        style={[
          styles.label,
          {
            color: config.textColor,
          },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

