/**
 * Empty state component for roadmap
 */

import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';

export function RoadmapEmptyState() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={iconStyle}>
        <Ionicons
          name="map-outline"
          size={64}
          color={isDark ? Colors.dark.icon : Colors.light.icon}
          style={styles.icon}
        />
      </Animated.View>
      <ThemedText type="title" style={styles.title}>
        No Care Roadmap Yet
      </ThemedText>
      <ThemedText style={styles.description}>
        Your personalized care journey will appear here once your healthcare provider creates a roadmap for you.
      </ThemedText>
      <ThemedText style={styles.hint}>
        Check back soon or contact your provider for more information.
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  icon: {
    marginBottom: Spacing.lg,
    opacity: 0.6,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    opacity: 0.8,
    lineHeight: 24,
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});

