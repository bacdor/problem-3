/**
 * Step type configuration with icons and styling
 */

import { Ionicons } from '@expo/vector-icons';
import type { StepType } from '@/types/database';
import { StepTypeColors } from '@/constants/theme';

export interface StepTypeConfig {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: { light: string; dark: string };
  description: string;
}

export const stepTypeConfigs: Record<StepType, StepTypeConfig> = {
  referral_received: {
    label: 'Referral Received',
    icon: 'document-text',
    color: StepTypeColors.referral_received,
    description: 'A referral has been received from your healthcare provider',
  },
  appointment_scheduled: {
    label: 'Appointment Scheduled',
    icon: 'calendar',
    color: StepTypeColors.appointment_scheduled,
    description: 'An appointment has been scheduled',
  },
  tests_labs: {
    label: 'Tests & Labs',
    icon: 'flask',
    color: StepTypeColors.tests_labs,
    description: 'Laboratory tests or diagnostic procedures',
  },
  specialist_consultation: {
    label: 'Specialist Consultation',
    icon: 'medical',
    color: StepTypeColors.specialist_consultation,
    description: 'Consultation with a specialist',
  },
  follow_up_care: {
    label: 'Follow-up Care',
    icon: 'heart',
    color: StepTypeColors.follow_up_care,
    description: 'Follow-up care or monitoring',
  },
};

/**
 * Get configuration for a step type
 */
export function getStepTypeConfig(stepType: StepType): StepTypeConfig {
  return stepTypeConfigs[stepType];
}

/**
 * Get icon name for a step type
 */
export function getStepTypeIcon(stepType: StepType): keyof typeof Ionicons.glyphMap {
  return stepTypeConfigs[stepType].icon;
}

/**
 * Get color for a step type (theme-aware)
 */
export function getStepTypeColor(stepType: StepType, isDark: boolean = false): string {
  return isDark ? stepTypeConfigs[stepType].color.dark : stepTypeConfigs[stepType].color.light;
}

