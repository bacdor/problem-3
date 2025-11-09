/**
 * Step details page - comprehensive view of a care step
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StepStatusIndicator } from '@/components/roadmap/StepStatusIndicator';
import { StepTypeIcon } from '@/components/roadmap/StepTypeIcon';
import { StatusBadge } from '@/components/roadmap/StatusBadge';
import { InfoCard } from '@/components/roadmap/InfoCard';
import { LocationCard } from '@/components/roadmap/LocationCard';
import {
  Colors,
  RoadmapColors,
  Spacing,
  BorderRadius,
  Shadows,
  RoadmapTypography,
} from '@/constants/theme';
import { formatStepDate, formatDateTime } from '@/lib/dateUtils';
import { getEffectiveStatus } from '@/lib/stepStatus';
import { getCareStep, markStepComplete } from '@/lib/roadmap';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import type { CareStep } from '@/types/database';

export default function StepDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [step, setStep] = useState<CareStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStep();
    }
  }, [id]);

  const fetchStep = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const result = await getCareStep(id);
    if (result.error) {
      setError(result.error.message);
    } else {
      setStep(result.step);
    }

    setLoading(false);
  };

  const handleBack = () => {
    router.back();
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

  const handleMarkComplete = async () => {
    if (!step) return;

    try {
      const result = await markStepComplete(step.id);
      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else if (result.step) {
        setStep(result.step);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Step marked as complete');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to mark step as complete. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RoadmapColors.light.completed} />
          <ThemedText style={styles.loadingText}>Loading step details...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !step) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={isDark ? RoadmapColors.dark.overdue : RoadmapColors.light.overdue}
          />
          <ThemedText type="title" style={styles.errorTitle}>
            {error || 'Step not found'}
          </ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const effectiveStatus = getEffectiveStatus(step);
  const isCompleted = effectiveStatus === 'completed';

  // Determine clinic approval status
  const getClinicApprovalStatus = (): { type: 'approved' | 'pending' | 'rejected'; label: string } => {
    if (step.clinic_approved === true) {
      return { type: 'approved', label: 'Approved' };
    } else if (step.clinic_approved === false) {
      return { type: 'rejected', label: 'Not Approved' };
    }
    return { type: 'pending', label: 'Pending Approval' };
  };

  // Determine data received status
  const getDataReceivedStatus = (): { type: 'received' | 'not_received'; label: string } => {
    if (step.previous_data_received === true) {
      return { type: 'received', label: 'Received' };
    }
    return { type: 'not_received', label: 'Not Received' };
  };

  const clinicApproval = getClinicApprovalStatus();
  const dataReceived = getDataReceivedStatus();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <ThemedView
          style={[
            styles.header,
            {
              backgroundColor: isDark
                ? RoadmapColors.dark.stepBackground
                : RoadmapColors.light.stepBackground,
              borderBottomColor: isDark
                ? RoadmapColors.dark.stepBorder
                : RoadmapColors.light.stepBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <StepTypeIcon stepType={step.step_type} size={32} />
            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.headerTitle} numberOfLines={2}>
                {step.title}
              </ThemedText>
              <StepStatusIndicator step={step} size="small" showLabel />
            </View>
          </View>
        </ThemedView>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Description */}
        {step.description && (
          <InfoCard>
            <ThemedText style={styles.description}>{step.description}</ThemedText>
          </InfoCard>
        )}

        {/* Doctor Information */}
        {(step.provider_name || step.provider_phone || step.provider_specialty) && (
          <InfoCard
            title="Doctor"
            icon={
              <Ionicons
                name="person-outline"
                size={20}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
            }
          >
            {step.provider_name && (
              <ThemedText style={styles.providerName}>{step.provider_name}</ThemedText>
            )}
            {step.provider_specialty && (
              <ThemedText style={styles.providerSpecialty}>{step.provider_specialty}</ThemedText>
            )}
            {step.provider_phone && (
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => handleCallProvider(step.provider_phone!)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${step.provider_name || 'provider'} at ${step.provider_phone}`}
                accessibilityHint="Opens phone dialer"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="call-outline" size={18} color={RoadmapColors.light.completed} />
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
          </InfoCard>
        )}

        {/* Location */}
        <LocationCard
          locationName={step.location_name}
          locationAddress={step.location_address}
          locationPhone={step.location_phone}
        />

        {/* Appointment Details */}
        {(step.scheduled_date ||
          step.due_date ||
          step.completed_date ||
          step.estimated_duration ||
          step.appointment_confirmation_code) && (
          <InfoCard
            title="Appointment Details"
            icon={
              <Ionicons
                name="calendar-outline"
                size={20}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
            }
          >
            {step.scheduled_date && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Scheduled:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatStepDate(step.scheduled_date)}
                </ThemedText>
              </View>
            )}
            {step.due_date && !step.scheduled_date && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Due:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatStepDate(step.due_date)}
                </ThemedText>
              </View>
            )}
            {step.estimated_duration && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Duration:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {step.estimated_duration} minutes
                </ThemedText>
              </View>
            )}
            {step.appointment_confirmation_code && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Confirmation:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {step.appointment_confirmation_code}
                </ThemedText>
              </View>
            )}
            {step.completed_date && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Completed:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatDateTime(step.completed_date)}
                </ThemedText>
              </View>
            )}
          </InfoCard>
        )}

        {/* Preparation Instructions */}
        {step.prep_instructions && (
          <InfoCard
            title="Preparation Instructions"
            icon={
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
            }
          >
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
          </InfoCard>
        )}

        {/* Status Information */}
        <InfoCard
          title="Status Information"
          icon={
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={isDark ? '#9BA1A6' : '#687076'}
            />
          }
        >
          {/* Clinic Approval Status */}
          {step.clinic_approved !== null && (
            <View style={styles.statusRow}>
              <ThemedText style={styles.statusLabel}>Clinic Approval:</ThemedText>
              <StatusBadge type={clinicApproval.type} label={clinicApproval.label} />
            </View>
          )}

          {/* Data Received Status */}
          {step.previous_data_received !== null && (
            <View style={styles.statusRow}>
              <ThemedText style={styles.statusLabel}>Previous Data:</ThemedText>
              <StatusBadge type={dataReceived.type} label={dataReceived.label} />
            </View>
          )}

          {/* Overall Step Status */}
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusLabel}>Step Status:</ThemedText>
            <StepStatusIndicator step={step} size="small" showLabel />
          </View>
        </InfoCard>

        {/* Notes */}
        {step.notes && (
          <InfoCard
            title="Additional Notes"
            icon={
              <Ionicons
                name="document-text-outline"
                size={20}
                color={isDark ? '#9BA1A6' : '#687076'}
              />
            }
          >
            <ThemedText style={styles.notesText}>{step.notes}</ThemedText>
          </InfoCard>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!isCompleted && (
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    marginTop: Spacing.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    ...Shadows.sm,
  },
  backButtonHeader: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  description: {
    ...RoadmapTypography.stepDescription,
    lineHeight: 24,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  providerSpecialty: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  notesText: {
    ...RoadmapTypography.stepDescription,
    lineHeight: 22,
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
  backButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: RoadmapColors.light.completed,
    marginTop: Spacing.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

