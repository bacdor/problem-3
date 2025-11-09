/**
 * Step detail modal component (bottom sheet)
 */

import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StepStatusIndicator } from './StepStatusIndicator';
import { StepTypeIcon } from './StepTypeIcon';
import {
  RoadmapColors,
  Spacing,
  BorderRadius,
  Shadows,
  RoadmapTypography,
} from '@/constants/theme';
import { formatStepDate, formatDateTime } from '@/lib/dateUtils';
import { getEffectiveStatus } from '@/lib/stepStatus';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import type { CareStep } from '@/types/database';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StepDetailModalProps {
  step: CareStep | null;
  visible: boolean;
  onClose: () => void;
  onMarkComplete?: (step: CareStep) => void;
}

export function StepDetailModal({
  step,
  visible,
  onClose,
  onMarkComplete,
}: StepDetailModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(1000, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(1000, { duration: 200 }, () => {
          runOnJS(onClose)();
        });
        opacity.value = withTiming(0, { duration: 200 });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  const handleBackdropPress = () => {
    translateY.value = withTiming(1000, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const handleCallProvider = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
    }
  };

  const handleMarkComplete = () => {
    if (step && onMarkComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onMarkComplete(step);
    }
  };

  if (!step || !visible) {
    return null;
  }

  const effectiveStatus = getEffectiveStatus(step);
  const isCompleted = effectiveStatus === 'completed';

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.modal,
            modalStyle,
            {
              backgroundColor: isDark
                ? RoadmapColors.dark.stepBackground
                : RoadmapColors.light.stepBackground,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
            },
          ]}
          accessibilityRole="dialog"
          accessibilityLabel={`Step details for ${step.title}`}
        >
          {/* Handle */}
          <View
            style={[
              styles.handle,
              {
                backgroundColor: isDark ? '#374151' : '#D1D5DB',
              },
            ]}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <StepTypeIcon stepType={step.step_type} size={40} />
                <View style={styles.headerText}>
                  <ThemedText type="title" style={styles.title}>
                    {step.title}
                  </ThemedText>
                  <StepStatusIndicator step={step} size="medium" showLabel />
                </View>
              </View>
            </View>

            {/* Description */}
            {step.description && (
              <View style={styles.section}>
                <ThemedText style={styles.description}>{step.description}</ThemedText>
              </View>
            )}

            {/* Date/Time */}
            {(step.scheduled_date || step.due_date) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? '#9BA1A6' : '#687076'}
                  />
                  <ThemedText style={styles.sectionTitle}>Date & Time</ThemedText>
                </View>
                <ThemedText style={styles.sectionContent}>
                  {step.scheduled_date
                    ? formatStepDate(step.scheduled_date)
                    : step.due_date
                    ? `Due: ${formatStepDate(step.due_date)}`
                    : 'No date set'}
                </ThemedText>
                {step.completed_date && (
                  <ThemedText style={styles.completedDate}>
                    Completed: {formatDateTime(step.completed_date)}
                  </ThemedText>
                )}
              </View>
            )}

            {/* Prep Instructions */}
            {step.prep_instructions && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={isDark ? '#9BA1A6' : '#687076'}
                  />
                  <ThemedText style={styles.sectionTitle}>Preparation Instructions</ThemedText>
                </View>
                <ThemedView
                  style={[
                    styles.prepInstructions,
                    {
                      backgroundColor: isDark
                        ? RoadmapColors.dark.prepInstructionsBg
                        : RoadmapColors.light.prepInstructionsBg,
                      borderColor: isDark
                        ? RoadmapColors.dark.prepInstructionsBorder
                        : RoadmapColors.light.prepInstructionsBorder,
                    },
                  ]}
                >
                  <ThemedText style={styles.prepInstructionsText}>
                    {step.prep_instructions}
                  </ThemedText>
                </ThemedView>
              </View>
            )}

            {/* Provider Contact */}
            {(step.provider_name || step.provider_phone) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={isDark ? '#9BA1A6' : '#687076'}
                  />
                  <ThemedText style={styles.sectionTitle}>Provider</ThemedText>
                </View>
                {step.provider_name && (
                  <ThemedText style={styles.sectionContent}>{step.provider_name}</ThemedText>
                )}
                {step.provider_phone && (
                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={() => handleCallProvider(step.provider_phone!)}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${step.provider_name || 'provider'} at ${step.provider_phone}`}
                    accessibilityHint="Opens phone dialer to call provider"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="call-outline" size={20} color={RoadmapColors.light.completed} />
                    <ThemedText
                      style={[
                        styles.phoneText,
                        {
                          color: RoadmapColors.light.completed,
                        },
                      ]}
                    >
                      {step.provider_phone}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {!isCompleted && onMarkComplete && (
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    {
                      backgroundColor: RoadmapColors.light.completed,
                    },
                  ]}
                  onPress={handleMarkComplete}
                  accessibilityRole="button"
                  accessibilityLabel={`Mark ${step.title} as complete`}
                  accessibilityHint="Double tap to mark this step as completed"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.completeButtonText}>Mark as Complete</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    zIndex: 1001,
    ...Shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  sectionContent: {
    ...RoadmapTypography.stepDescription,
    marginLeft: Spacing.xl + 4,
  },
  description: {
    ...RoadmapTypography.stepDescription,
    lineHeight: 24,
  },
  completedDate: {
    ...RoadmapTypography.stepDate,
    marginLeft: Spacing.xl + 4,
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  prepInstructions: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  prepInstructionsText: {
    ...RoadmapTypography.stepDescription,
    lineHeight: 22,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xl + 4,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

