/**
 * Roadmap data fetching and mutation functions
 */

import { supabase } from './supabase';
import type { CareRoadmap, CareStep, StepStatus } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RoadmapWithSteps extends CareRoadmap {
  steps: CareStep[];
}

export interface RoadmapError {
  message: string;
  code?: string;
}

/**
 * Get all roadmaps for a patient
 */
export async function getRoadmaps(patientId: string): Promise<{
  roadmaps: CareRoadmap[];
  error: RoadmapError | null;
}> {
  try {
    const { data, error } = await supabase
      .from('care_roadmaps')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        roadmaps: [],
        error: { message: error.message, code: error.code },
      };
    }

    return { roadmaps: (data || []) as CareRoadmap[], error: null };
  } catch (error: any) {
    return {
      roadmaps: [],
      error: { message: error.message || 'Failed to fetch roadmaps' },
    };
  }
}

/**
 * Get a single roadmap with its steps
 */
export async function getRoadmapWithSteps(roadmapId: string): Promise<{
  roadmap: RoadmapWithSteps | null;
  error: RoadmapError | null;
}> {
  try {
    const { data: roadmapData, error: roadmapError } = await supabase
      .from('care_roadmaps')
      .select('*')
      .eq('id', roadmapId)
      .single();

    if (roadmapError) {
      return {
        roadmap: null,
        error: { message: roadmapError.message, code: roadmapError.code },
      };
    }

    const { data: stepsData, error: stepsError } = await supabase
      .from('care_steps')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('order', { ascending: true })
      .order('scheduled_date', { ascending: true, nullsFirst: false });

    if (stepsError) {
      return {
        roadmap: null,
        error: { message: stepsError.message, code: stepsError.code },
      };
    }

    const roadmap: RoadmapWithSteps = {
      ...(roadmapData as CareRoadmap),
      steps: (stepsData || []) as CareStep[],
    };

    return { roadmap, error: null };
  } catch (error: any) {
    return {
      roadmap: null,
      error: { message: error.message || 'Failed to fetch roadmap' },
    };
  }
}

/**
 * Get care steps for a roadmap
 */
export async function getCareSteps(roadmapId: string): Promise<{
  steps: CareStep[];
  error: RoadmapError | null;
}> {
  try {
    const { data, error } = await supabase
      .from('care_steps')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('order', { ascending: true })
      .order('scheduled_date', { ascending: true, nullsFirst: false });

    if (error) {
      return {
        steps: [],
        error: { message: error.message, code: error.code },
      };
    }

    return { steps: (data || []) as CareStep[], error: null };
  } catch (error: any) {
    return {
      steps: [],
      error: { message: error.message || 'Failed to fetch steps' },
    };
  }
}

/**
 * Update step status
 */
export async function updateStepStatus(
  stepId: string,
  status: StepStatus
): Promise<{ step: CareStep | null; error: RoadmapError | null }> {
  try {
    const updateData: Partial<CareStep> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If marking as completed, set completed_date
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
    } else if (status !== 'completed' && status !== 'overdue') {
      // If changing from completed to another status, clear completed_date
      updateData.completed_date = null;
    }

    const { data, error } = await supabase
      .from('care_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      return {
        step: null,
        error: { message: error.message, code: error.code },
      };
    }

    return { step: data as CareStep, error: null };
  } catch (error: any) {
    return {
      step: null,
      error: { message: error.message || 'Failed to update step status' },
    };
  }
}

/**
 * Mark a step as completed
 */
export async function markStepComplete(stepId: string): Promise<{
  step: CareStep | null;
  error: RoadmapError | null;
}> {
  return updateStepStatus(stepId, 'completed');
}

/**
 * Subscribe to roadmap updates (real-time)
 */
export function subscribeToRoadmapUpdates(
  roadmapId: string,
  callback: (step: CareStep) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`roadmap:${roadmapId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'care_steps',
        filter: `roadmap_id=eq.${roadmapId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as CareStep);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from roadmap updates
 */
export function unsubscribeFromRoadmapUpdates(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

