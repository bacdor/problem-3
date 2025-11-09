/**
 * Progress indicator component
 */

import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadmapColors, RoadmapTypography, Spacing, BorderRadius } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ProgressIndicator({ 
  progress, 
  showLabel = true,
  size = 'medium' 
}: ProgressIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const progressValue = useSharedValue(0);
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(Math.max(0, Math.min(100, progress)), {
      damping: 15,
      stiffness: 100,
    });
    animatedProgress.value = withTiming(Math.max(0, Math.min(100, progress)), {
      duration: 800,
    });
  }, [progress]);

  const sizeConfig = {
    small: { width: 60, height: 60, strokeWidth: 6 },
    medium: { width: 80, height: 80, strokeWidth: 8 },
    large: { width: 100, height: 100, strokeWidth: 10 },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Note: Circular progress would require SVG. Using simpler linear version for now.
  const progressStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(progressValue.value > 0 ? 1 : 0, { duration: 300 }),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { width: config.width, height: config.height }]}>
        <Animated.View style={[styles.circle, { width: config.width, height: config.height }]}>
          <Animated.Text
            style={[
              styles.progressText,
              textStyle,
              { fontSize: size === 'large' ? 20 : size === 'medium' ? 18 : 16 },
            ]}
          >
            {Math.round(progress)}%
          </Animated.Text>
        </Animated.View>
      </View>
      {showLabel && (
        <ThemedText style={styles.label}>
          Complete
        </ThemedText>
      )}
    </View>
  );
}

// Linear progress bar version (simpler)
export function LinearProgressIndicator({ progress }: { progress: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(Math.max(0, Math.min(100, progress)), {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  return (
    <View style={styles.linearContainer}>
      <ThemedView
        style={[
          styles.linearTrack,
          { backgroundColor: isDark ? RoadmapColors.dark.timeline : RoadmapColors.light.timeline },
        ]}
      >
        <Animated.View
          style={[
            styles.linearProgress,
            progressStyle,
            {
              backgroundColor: isDark
                ? RoadmapColors.dark.completed
                : RoadmapColors.light.completed,
            },
          ]}
        />
      </ThemedView>
      <ThemedText style={styles.linearLabel}>{Math.round(progress)}%</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#E5E7EB',
  },
  progressText: {
    fontWeight: '700',
    color: '#11181C',
  },
  label: {
    marginTop: Spacing.sm,
    fontSize: 12,
    opacity: 0.7,
  },
  linearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  linearTrack: {
    flex: 1,
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  linearProgress: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  linearLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});

