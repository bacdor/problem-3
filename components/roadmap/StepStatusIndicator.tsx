/**
 * Step status indicator component with animations
 */

import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { RoadmapColors, BorderRadius, Spacing } from '@/constants/theme';
import { getStepStatusColor, getEffectiveStatus } from '@/lib/stepStatus';
import type { CareStep, StepStatus } from '@/types/database';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface StepStatusIndicatorProps {
  step: CareStep;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function StepStatusIndicator({
  step,
  size = 'medium',
  showLabel = false,
}: StepStatusIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const effectiveStatus = getEffectiveStatus(step);
  const color = getStepStatusColor(effectiveStatus, step, isDark);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  const sizeConfig = {
    small: { dot: 8, icon: 12, badge: 16 },
    medium: { dot: 12, icon: 16, badge: 20 },
    large: { dot: 16, icon: 20, badge: 24 },
  };

  const config = sizeConfig[size];

  // Pulse animation for in_progress steps
  useEffect(() => {
    if (effectiveStatus === 'in_progress') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [effectiveStatus]);

  // Scale animation on status change
  useEffect(() => {
    scale.value = withSpring(1.2, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
  }, [step.status]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (effectiveStatus) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'overdue':
        return 'alert-circle';
      case 'pending':
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusLabel = (): string => {
    switch (effectiveStatus) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'overdue':
        return 'Overdue';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const statusLabel = getStatusLabel();
  const accessibilityLabel = `Status: ${statusLabel}`;

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.badge,
          pulseStyle,
          scaleStyle,
          {
            width: config.badge,
            height: config.badge,
            borderRadius: config.badge / 2,
            backgroundColor: color,
          },
        ]}
        accessibilityElementsHidden={true}
      >
        <Ionicons
          name={getStatusIcon()}
          size={config.icon}
          color="#FFFFFF"
          style={styles.icon}
        />
      </Animated.View>
      {showLabel && (
        <ThemedText
          style={[
            styles.label,
            {
              color,
            },
          ]}
          accessible={true}
          accessibilityLabel={statusLabel}
        >
          {statusLabel}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    ...BorderRadius.full,
  },
  icon: {
    // Icon styling
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

