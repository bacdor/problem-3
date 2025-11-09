/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Roadmap-specific colors
export const RoadmapColors = {
  light: {
    completed: '#10B981',
    inProgress: '#3B82F6',
    pending: '#F59E0B',
    overdue: '#EF4444',
    timeline: '#E5E7EB',
    stepBackground: '#FFFFFF',
    stepBorder: '#E5E7EB',
    stepShadow: 'rgba(0, 0, 0, 0.1)',
    prepInstructionsBg: '#F3F4F6',
    prepInstructionsBorder: '#D1D5DB',
  },
  dark: {
    completed: '#34D399',
    inProgress: '#60A5FA',
    pending: '#FBBF24',
    overdue: '#F87171',
    timeline: '#374151',
    stepBackground: '#1F2937',
    stepBorder: '#374151',
    stepShadow: 'rgba(0, 0, 0, 0.3)',
    prepInstructionsBg: '#111827',
    prepInstructionsBorder: '#374151',
  },
};

// Step type colors
export const StepTypeColors = {
  referral_received: { light: '#3B82F6', dark: '#60A5FA' },
  appointment_scheduled: { light: '#8B5CF6', dark: '#A78BFA' },
  tests_labs: { light: '#F59E0B', dark: '#FBBF24' },
  specialist_consultation: { light: '#14B8A6', dark: '#5EEAD4' },
  follow_up_care: { light: '#EC4899', dark: '#F472B6' },
};

// Spacing scale (8px grid system)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Border radius scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// Shadow elevations
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation timing constants
export const AnimationTiming = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

// Typography scale for roadmap
export const RoadmapTypography = {
  stepTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  stepDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  stepDate: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
