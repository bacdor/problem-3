/**
 * Proactive alert generation logic
 */

import * as roadmapService from './roadmap';
import { isOverdue, getNextUpcomingStep } from './stepStatus';
import { formatRelativeDate, getDaysUntil } from './dateUtils';
import type { CareStep } from '@/types/database';

export type AlertUrgency = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  type: 'upcoming_appointment' | 'overdue_step' | 'prep_reminder';
  urgency: AlertUrgency;
  title: string;
  message: string;
  stepId?: string;
  roadmapId?: string;
  actionLabel?: string;
}

/**
 * Generate proactive alerts for a patient
 */
export async function generateProactiveAlerts(
  patientId: string
): Promise<{
  alerts: Alert[];
  error: { message: string } | null;
}> {
  try {
    // Get all active roadmaps
    const roadmapsResult = await roadmapService.getRoadmaps(patientId);
    if (roadmapsResult.error) {
      return {
        alerts: [],
        error: { message: roadmapsResult.error.message },
      };
    }

    const activeRoadmaps = roadmapsResult.roadmaps.filter(
      (r) => r.status === 'active'
    );

    const alerts: Alert[] = [];

    // Check each roadmap for alerts
    for (const roadmap of activeRoadmaps) {
      const roadmapResult = await roadmapService.getRoadmapWithSteps(
        roadmap.id
      );

      if (roadmapResult.error || !roadmapResult.roadmap) {
        continue;
      }

      const steps = roadmapResult.roadmap.steps;

      // Check for overdue steps
      const overdueSteps = steps.filter((step) => isOverdue(step));
      overdueSteps.forEach((step) => {
        alerts.push({
          id: `overdue-${step.id}`,
          type: 'overdue_step',
          urgency: 'high',
          title: 'Overdue Step',
          message: `Your step "${step.title}" is overdue. Please complete it as soon as possible.`,
          stepId: step.id,
          roadmapId: roadmap.id,
          actionLabel: 'View Step',
        });
      });

      // Check for upcoming appointments (24-48 hours)
      const upcomingSteps = steps.filter((step) => {
        if (step.status === 'completed') return false;
        if (!step.scheduled_date) return false;

        const daysUntil = getDaysUntil(step.scheduled_date);
        return daysUntil >= 0 && daysUntil <= 2; // Within 2 days
      });

      upcomingSteps.forEach((step) => {
        const daysUntil = getDaysUntil(step.scheduled_date!);
        const relativeDate = formatRelativeDate(step.scheduled_date);

        if (daysUntil === 0) {
          // Today
          alerts.push({
            id: `upcoming-today-${step.id}`,
            type: 'upcoming_appointment',
            urgency: 'high',
            title: 'Appointment Today',
            message: `Your "${step.title}" is scheduled for today. ${step.prep_instructions ? `Remember: ${step.prep_instructions}` : ''}`,
            stepId: step.id,
            roadmapId: roadmap.id,
            actionLabel: 'View Details',
          });
        } else if (daysUntil === 1) {
          // Tomorrow
          alerts.push({
            id: `upcoming-tomorrow-${step.id}`,
            type: 'upcoming_appointment',
            urgency: 'medium',
            title: 'Appointment Tomorrow',
            message: `Your "${step.title}" is scheduled for tomorrow (${relativeDate}). ${step.prep_instructions ? `Prep: ${step.prep_instructions}` : ''}`,
            stepId: step.id,
            roadmapId: roadmap.id,
            actionLabel: 'View Details',
          });
        } else if (daysUntil === 2) {
          // In 2 days
          alerts.push({
            id: `upcoming-soon-${step.id}`,
            type: 'upcoming_appointment',
            urgency: 'low',
            title: 'Upcoming Appointment',
            message: `Your "${step.title}" is scheduled for ${relativeDate}. ${step.prep_instructions ? `Don't forget: ${step.prep_instructions}` : ''}`,
            stepId: step.id,
            roadmapId: roadmap.id,
            actionLabel: 'View Details',
          });
        }
      });

      // Check for prep instruction reminders (for steps happening soon)
      const stepsNeedingPrep = steps.filter((step) => {
        if (step.status === 'completed') return false;
        if (!step.prep_instructions) return false;
        if (!step.scheduled_date && !step.due_date) return false;

        const date = step.scheduled_date || step.due_date!;
        const daysUntil = getDaysUntil(date);
        // Remind 1-3 days before
        return daysUntil >= 1 && daysUntil <= 3;
      });

      stepsNeedingPrep.forEach((step) => {
        const date = step.scheduled_date || step.due_date!;
        const daysUntil = getDaysUntil(date);
        const relativeDate = formatRelativeDate(date);

        alerts.push({
          id: `prep-${step.id}`,
          type: 'prep_reminder',
          urgency: daysUntil === 1 ? 'high' : 'medium',
          title: 'Prep Instructions Reminder',
          message: `For your "${step.title}" on ${relativeDate}: ${step.prep_instructions}`,
          stepId: step.id,
          roadmapId: roadmap.id,
          actionLabel: 'View Step',
        });
      });
    }

    // Sort alerts by urgency (high first)
    alerts.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return { alerts, error: null };
  } catch (error: any) {
    return {
      alerts: [],
      error: { message: error.message || 'Failed to generate alerts' },
    };
  }
}

/**
 * Get the next step that needs attention
 */
export async function getNextStepAlert(
  patientId: string
): Promise<{
  step: CareStep | null;
  roadmapId: string | null;
  error: { message: string } | null;
}> {
  try {
    const roadmapsResult = await roadmapService.getRoadmaps(patientId);
    if (roadmapsResult.error) {
      return {
        step: null,
        roadmapId: null,
        error: { message: roadmapsResult.error.message },
      };
    }

    const activeRoadmaps = roadmapsResult.roadmaps.filter(
      (r) => r.status === 'active'
    );

    for (const roadmap of activeRoadmaps) {
      const roadmapResult = await roadmapService.getRoadmapWithSteps(
        roadmap.id
      );

      if (roadmapResult.error || !roadmapResult.roadmap) {
        continue;
      }

      const nextStep = getNextUpcomingStep(roadmapResult.roadmap.steps);
      if (nextStep) {
        return {
          step: nextStep,
          roadmapId: roadmap.id,
          error: null,
        };
      }
    }

    return {
      step: null,
      roadmapId: null,
      error: null,
    };
  } catch (error: any) {
    return {
      step: null,
      roadmapId: null,
      error: { message: error.message || 'Failed to get next step' },
    };
  }
}

