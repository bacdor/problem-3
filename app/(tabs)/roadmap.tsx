/**
 * Main roadmap screen
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader';
import { StepDetailModal } from '@/components/roadmap/StepDetailModal';
import { RoadmapLoadingSkeleton } from '@/components/roadmap/RoadmapLoadingSkeleton';
import { useRoadmaps, useRoadmapWithSteps } from '@/hooks/useRoadmap';
import { useCareSteps } from '@/hooks/useCareSteps';
import { Spacing } from '@/constants/theme';
import type { CareStep, CareRoadmap } from '@/types/database';

export default function RoadmapScreen() {
  const colorScheme = useColorScheme();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<CareStep | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all roadmaps
  const { roadmaps, loading: roadmapsLoading, error: roadmapsError, refetch: refetchRoadmaps } = useRoadmaps();

  // Fetch selected roadmap with steps
  const {
    roadmap: selectedRoadmap,
    loading: roadmapLoading,
    error: roadmapError,
    refetch: refetchRoadmap,
  } = useRoadmapWithSteps(selectedRoadmapId);

  // Use care steps hook for optimistic updates
  const {
    steps,
    loading: stepsLoading,
    error: stepsError,
    markComplete,
    refetch: refetchSteps,
  } = useCareSteps(selectedRoadmapId);

  // Auto-select first roadmap if available
  useMemo(() => {
    if (roadmaps.length > 0 && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, selectedRoadmapId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchRoadmaps(), refetchRoadmap(), refetchSteps()]);
    setRefreshing(false);
  }, [refetchRoadmaps, refetchRoadmap, refetchSteps]);

  const handleStepPress = useCallback((step: CareStep) => {
    setSelectedStep(step);
    setModalVisible(true);
  }, []);

  // Debounce refresh to prevent rapid successive calls
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      handleRefresh();
    }, 300);
  }, [handleRefresh]);

  const handleStepMarkComplete = useCallback(
    async (step: CareStep) => {
      try {
        await markComplete(step.id);
        setModalVisible(false);
        setSelectedStep(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to mark step as complete. Please try again.');
      }
    },
    [markComplete]
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedStep(null);
  }, []);

  const loading = roadmapsLoading || roadmapLoading || stepsLoading;
  const error = roadmapsError || roadmapError || stepsError;

  // Loading state
  if (loading && roadmaps.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.content}>
          <RoadmapLoadingSkeleton count={5} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && roadmaps.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.content}>
          <View style={styles.errorContainer}>
            <ThemedText type="title" style={styles.errorTitle}>
              Something went wrong
            </ThemedText>
            <ThemedText style={styles.errorMessage}>{error.message}</ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}
              accessibilityRole="button"
              accessibilityLabel="Retry loading roadmap"
              accessibilityHint="Double tap to retry loading the roadmap"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // No roadmaps
  if (roadmaps.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.content}>
          <RoadmapTimeline
            steps={[]}
            loading={false}
            onStepPress={handleStepPress}
            onStepMarkComplete={handleStepMarkComplete}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Multiple roadmaps - show selector
  if (roadmaps.length > 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.content}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.roadmapSelector}
            contentContainerStyle={styles.roadmapSelectorContent}
          >
            {roadmaps.map((roadmap) => (
              <TouchableOpacity
                key={roadmap.id}
                style={[
                  styles.roadmapTab,
                  selectedRoadmapId === roadmap.id && styles.roadmapTabActive,
                ]}
                onPress={() => setSelectedRoadmapId(roadmap.id)}
                accessibilityRole="tab"
                accessibilityLabel={`${roadmap.title} roadmap`}
                accessibilityState={{
                  selected: selectedRoadmapId === roadmap.id,
                }}
                accessibilityHint="Double tap to view this roadmap"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ThemedText
                  style={[
                    styles.roadmapTabText,
                    selectedRoadmapId === roadmap.id && styles.roadmapTabTextActive,
                  ]}
                >
                  {roadmap.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedRoadmap && (
            <>
              <RoadmapHeader roadmap={selectedRoadmap} steps={steps} />
              <RoadmapTimeline
                steps={steps}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onStepPress={handleStepPress}
                onStepMarkComplete={handleStepMarkComplete}
              />
            </>
          )}
        </ThemedView>

        <StepDetailModal
          step={selectedStep}
          visible={modalVisible}
          onClose={handleCloseModal}
          onMarkComplete={handleStepMarkComplete}
        />
      </SafeAreaView>
    );
  }

  // Single roadmap
  const roadmap = roadmaps[0];
  if (!roadmap) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        {selectedRoadmap && <RoadmapHeader roadmap={selectedRoadmap} steps={steps} />}
        <RoadmapTimeline
          steps={steps}
          loading={loading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onStepPress={handleStepPress}
          onStepMarkComplete={handleStepMarkComplete}
        />
      </ThemedView>

      <StepDetailModal
        step={selectedStep}
        visible={modalVisible}
        onClose={handleCloseModal}
        onMarkComplete={handleStepMarkComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  roadmapSelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  roadmapSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  roadmapTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginVertical: Spacing.sm,
  },
  roadmapTabActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  roadmapTabText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  roadmapTabTextActive: {
    opacity: 1,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
