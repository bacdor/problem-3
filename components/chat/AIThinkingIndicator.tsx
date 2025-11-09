/**
 * Loading indicator for AI response
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BorderRadius } from '@/constants/theme';

export function AIThinkingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ];

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  const opacity1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <ThemedView style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
        </View>
        <ThemedText style={styles.text} lightColor="#6B7280" darkColor="#9CA3AF">
          AI is thinking...
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.xs,
    backgroundColor: '#F3F4F6',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginHorizontal: 3,
  },
  text: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

