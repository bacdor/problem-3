/**
 * Roadmap timeline component - main container
 */

import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from '@/components/themed-view';
import { RoadmapStep } from './RoadmapStep';
import { RoadmapEmptyState } from './RoadmapEmptyState';
import { RoadmapLoadingSkeleton } from './RoadmapLoadingSkeleton';
import { RoadmapColors, Spacing } from '@/constants/theme';
import { getStepUrgency } from '@/lib/stepStatus';
import type { CareStep } from '@/types/database';
import { useMemo, useCallback } from 'react';

interface RoadmapTimelineProps {
  steps: CareStep[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onStepPress: (step: CareStep) => void;
  onStepMarkComplete?: (step: CareStep) => void;
}

export function RoadmapTimeline({
  steps,
  loading = false,
  refreshing = false,
  onRefresh,
  onStepPress,
  onStepMarkComplete,
}: RoadmapTimelineProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Sort steps by urgency (overdue first, then by date)
  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => {
      const urgencyA = getStepUrgency(a);
      const urgencyB = getStepUrgency(b);
      return urgencyA - urgencyB;
    });
  }, [steps]);

  // Memoize render item to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item, index }: { item: CareStep; index: number }) => (
      <RoadmapStep
        step={item}
        index={index}
        onPress={onStepPress}
        onMarkComplete={onStepMarkComplete}
      />
    ),
    [onStepPress, onStepMarkComplete]
  );

  const keyExtractor = useCallback((item: CareStep) => item.id, []);

  if (loading) {
    return <RoadmapLoadingSkeleton count={5} />;
  }

  if (sortedSteps.length === 0) {
    return <RoadmapEmptyState />;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Timeline line */}
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

      <FlatList
        data={sortedSteps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: Spacing.xl + 8 + 5, // Align with timeline dots
    top: 0,
    bottom: 0,
    width: 2,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});

