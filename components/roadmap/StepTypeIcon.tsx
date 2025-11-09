/**
 * Step type icon component
 */

import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStepTypeConfig } from '@/lib/stepTypes';
import type { StepType } from '@/types/database';

interface StepTypeIconProps {
  stepType: StepType;
  size?: number;
  color?: string;
}

export function StepTypeIcon({ stepType, size = 24, color }: StepTypeIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const config = getStepTypeConfig(stepType);
  const iconColor = color || config.color[isDark ? 'dark' : 'light'];

  return <Ionicons name={config.icon} size={size} color={iconColor} />;
}

