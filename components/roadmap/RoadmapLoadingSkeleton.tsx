/**
 * Loading skeleton component for roadmap
 */

import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from '@/components/themed-view';
import { RoadmapColors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface SkeletonStepProps {
  index: number;
}

function SkeletonStep({ index }: SkeletonStepProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return {
      opacity,
    };
  });

  const delay = index * 100;

  return (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          backgroundColor: isDark
            ? RoadmapColors.dark.stepBackground
            : RoadmapColors.light.stepBackground,
          borderColor: isDark
            ? RoadmapColors.dark.stepBorder
            : RoadmapColors.light.stepBorder,
        },
        Shadows.md,
        { opacity: 0 },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          shimmerStyle,
          {
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
          },
        ]}
      />
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View
            style={[
              styles.iconPlaceholder,
              {
                backgroundColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
          />
          <View style={styles.textContainer}>
            <View
              style={[
                styles.titlePlaceholder,
                {
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                },
              ]}
            />
            <View
              style={[
                styles.datePlaceholder,
                {
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export function RoadmapLoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonStep key={index} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  stepContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stepContent: {
    position: 'relative',
    zIndex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  titlePlaceholder: {
    height: 16,
    width: '70%',
    borderRadius: BorderRadius.sm,
  },
  datePlaceholder: {
    height: 12,
    width: '40%',
    borderRadius: BorderRadius.sm,
  },
});

