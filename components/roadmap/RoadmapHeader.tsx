/**
 * Roadmap header component with progress indicator
 */

import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearProgressIndicator } from './ProgressIndicator';
import { Spacing, RoadmapTypography } from '@/constants/theme';
import { calculateProgress, getNextUpcomingStep } from '@/lib/stepStatus';
import { formatRelativeDate } from '@/lib/dateUtils';
import type { CareRoadmap, CareStep } from '@/types/database';

interface RoadmapHeaderProps {
  roadmap: CareRoadmap;
  steps: CareStep[];
}

export function RoadmapHeader({ roadmap, steps }: RoadmapHeaderProps) {
  const colorScheme = useColorScheme();
  const progress = calculateProgress(steps);
  const nextStep = getNextUpcomingStep(steps);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {roadmap.title}
        </ThemedText>
        <ThemedText style={styles.status}>
          {roadmap.status === 'active' ? 'Active' : roadmap.status === 'completed' ? 'Completed' : 'Cancelled'}
        </ThemedText>
      </View>

      <View style={styles.progressSection}>
        <LinearProgressIndicator progress={progress} />
      </View>

      {nextStep && (
        <View style={styles.nextStepSection}>
          <ThemedText style={styles.nextStepLabel}>Next Step:</ThemedText>
          <ThemedText style={styles.nextStepTitle}>{nextStep.title}</ThemedText>
          {nextStep.scheduled_date && (
            <ThemedText style={styles.nextStepDate}>
              {formatRelativeDate(nextStep.scheduled_date)}
            </ThemedText>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
    paddingTop: 4,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  nextStepSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  nextStepLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  nextStepTitle: {
    ...RoadmapTypography.stepTitle,
    marginBottom: Spacing.xs,
  },
  nextStepDate: {
    ...RoadmapTypography.stepDate,
    opacity: 0.7,
  },
});

