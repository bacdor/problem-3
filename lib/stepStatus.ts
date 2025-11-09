/**
 * Step status calculation utilities
 */

import type { CareStep, StepStatus } from '@/types/database';

/**
 * Check if a step is overdue
 */
export function isOverdue(step: CareStep): boolean {
  if (step.status === 'completed') {
    return false;
  }

  if (!step.due_date) {
    return false;
  }

  const dueDate = new Date(step.due_date);
  const now = new Date();
  
  // Compare dates (ignore time for overdue check)
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return dueDateOnly < nowOnly;
}

/**
 * Get the effective status of a step (considering overdue)
 */
export function getEffectiveStatus(step: CareStep): StepStatus {
  if (step.status === 'completed') {
    return 'completed';
  }

  if (isOverdue(step)) {
    return 'overdue';
  }

  return step.status;
}

/**
 * Get step status color (theme-aware)
 */
export function getStepStatusColor(
  status: StepStatus,
  step: CareStep,
  isDark: boolean = false
): string {
  const effectiveStatus = getEffectiveStatus(step);
  
  const colorMap = {
    completed: isDark ? '#34D399' : '#10B981',
    in_progress: isDark ? '#60A5FA' : '#3B82F6',
    pending: isDark ? '#FBBF24' : '#F59E0B',
    overdue: isDark ? '#F87171' : '#EF4444',
  };

  return colorMap[effectiveStatus];
}

/**
 * Calculate progress percentage from steps
 */
export function calculateProgress(steps: CareStep[]): number {
  if (steps.length === 0) {
    return 0;
  }

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  return Math.round((completedCount / steps.length) * 100);
}

/**
 * Get the next upcoming step that needs attention
 */
export function getNextUpcomingStep(steps: CareStep[]): CareStep | null {
  const now = new Date();
  
  // Filter out completed steps
  const activeSteps = steps.filter((step) => step.status !== 'completed');
  
  if (activeSteps.length === 0) {
    return null;
  }

  // Sort by scheduled_date or due_date, prioritizing overdue
  const sortedSteps = [...activeSteps].sort((a, b) => {
    // Overdue steps first
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by scheduled_date or due_date
    const aDate = a.scheduled_date || a.due_date;
    const bDate = b.scheduled_date || b.due_date;

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return sortedSteps[0] || null;
}

/**
 * Calculate urgency score for sorting (lower = more urgent)
 */
export function getStepUrgency(step: CareStep): number {
  if (step.status === 'completed') {
    return 999; // Completed steps go to the end
  }

  if (isOverdue(step)) {
    return 0; // Overdue steps are most urgent
  }

  if (!step.due_date && !step.scheduled_date) {
    return 500; // No date = medium priority
  }

  const date = step.due_date || step.scheduled_date;
  if (!date) {
    return 500;
  }

  const dateObj = new Date(date);
  const now = new Date();
  const daysUntil = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Return days until as urgency score (lower = more urgent)
  return Math.max(1, daysUntil);
}

