/**
 * Roadmap step component with animations and interactions
 */

import { StyleSheet, View, Pressable, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StepStatusIndicator } from './StepStatusIndicator';
import { StepTypeIcon } from './StepTypeIcon';
import { RoadmapColors, Spacing, BorderRadius, Shadows, RoadmapTypography } from '@/constants/theme';
import { formatRelativeDate, formatStepDate } from '@/lib/dateUtils';
import { getEffectiveStatus } from '@/lib/stepStatus';
import * as Haptics from 'expo-haptics';
import type { CareStep } from '@/types/database';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useEffect, memo } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RoadmapStepProps {
  step: CareStep;
  index: number;
  onPress: (step: CareStep) => void;
  onMarkComplete?: (step: CareStep) => void;
}

export const RoadmapStep = memo(function RoadmapStep({ step, index, onPress, onMarkComplete }: RoadmapStepProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const effectiveStatus = getEffectiveStatus(step);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // Entrance animation with stagger
  useEffect(() => {
    const delay = index * 50;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    onPress(step);
  };

  const handleMarkComplete = (e: any) => {
    e.stopPropagation();
    if (onMarkComplete && effectiveStatus !== 'completed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onMarkComplete(step);
    }
  };

  const isOverdue = effectiveStatus === 'overdue';
  const isCompleted = effectiveStatus === 'completed';

  const accessibilityLabel = [
    step.title,
    step.description && step.description,
    step.scheduled_date && `Scheduled for ${formatRelativeDate(step.scheduled_date)}`,
    effectiveStatus === 'completed' && 'Completed',
    effectiveStatus === 'overdue' && 'Overdue',
    effectiveStatus === 'in_progress' && 'In progress',
    effectiveStatus === 'pending' && 'Pending',
    'Tap to view details',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to view step details"
      accessibilityState={{
        disabled: false,
        selected: false,
      }}
    >
      <ThemedView
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? RoadmapColors.dark.stepBackground
              : RoadmapColors.light.stepBackground,
            borderColor: isOverdue
              ? (isDark ? RoadmapColors.dark.overdue : RoadmapColors.light.overdue)
              : isDark
              ? RoadmapColors.dark.stepBorder
              : RoadmapColors.light.stepBorder,
            borderWidth: isOverdue ? 2 : 1,
          },
          Shadows.md,
        ]}
      >
        {/* Timeline connector */}
        <View style={styles.timelineContainer}>
          <View
            style={[
              styles.timelineDot,
              {
                backgroundColor: isDark
                  ? RoadmapColors.dark.timeline
                  : RoadmapColors.light.timeline,
              },
            ]}
          />
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor: isDark
                  ? RoadmapColors.dark.timeline
                  : RoadmapColors.light.timeline,
              },
            ]}
          />
        </View>

        {/* Step content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <StepTypeIcon stepType={step.step_type} size={32} />
            </View>
            <View style={styles.textContainer}>
              <ThemedText style={[styles.title, isCompleted && styles.completedTitle]}>
                {step.title}
              </ThemedText>
              {step.scheduled_date && (
                <ThemedText style={[styles.date, isCompleted && styles.completedDate]}>
                  {formatRelativeDate(step.scheduled_date)}
                </ThemedText>
              )}
            </View>
            <StepStatusIndicator step={step} size="medium" />
          </View>

          {step.description && (
            <ThemedText
              style={[styles.description, isCompleted && styles.completedDescription]}
              numberOfLines={2}
            >
              {step.description}
            </ThemedText>
          )}

          {/* Quick action button */}
          {!isCompleted && onMarkComplete && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkComplete}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${step.title} as complete`}
              accessibilityHint="Double tap to mark this step as completed"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ThemedText style={styles.completeButtonText}>Mark Complete</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginLeft: Spacing.xl + 8,
    position: 'relative',
  },
  timelineContainer: {
    position: 'absolute',
    left: -(Spacing.xl + 8 + 6),
    top: 0,
    bottom: 0,
    width: 12,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconContainer: {
    // Icon container
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...RoadmapTypography.stepTitle,
  },
  completedTitle: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  date: {
    ...RoadmapTypography.stepDate,
    opacity: 0.7,
  },
  completedDate: {
    opacity: 0.5,
  },
  description: {
    ...RoadmapTypography.stepDescription,
    opacity: 0.8,
  },
  completedDescription: {
    opacity: 0.5,
  },
  completeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: RoadmapColors.light.completed,
    marginTop: Spacing.xs,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

