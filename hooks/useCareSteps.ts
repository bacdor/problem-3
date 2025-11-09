/**
 * React hook for care steps with optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as roadmapService from '@/lib/roadmap';
import type { CareStep, StepStatus } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseCareStepsResult {
  steps: CareStep[];
  loading: boolean;
  error: roadmapService.RoadmapError | null;
  updateStepStatus: (stepId: string, status: StepStatus) => Promise<void>;
  markComplete: (stepId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCareSteps(roadmapId: string | null): UseCareStepsResult {
  const [steps, setSteps] = useState<CareStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<roadmapService.RoadmapError | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const optimisticUpdatesRef = useRef<Map<string, CareStep>>(new Map());

  const fetchSteps = useCallback(async () => {
    if (!roadmapId) {
      setSteps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await roadmapService.getCareSteps(roadmapId);
    
    // Merge with any pending optimistic updates
    if (optimisticUpdatesRef.current.size > 0) {
      const mergedSteps = result.steps.map((step) => {
        const optimistic = optimisticUpdatesRef.current.get(step.id);
        return optimistic || step;
      });
      setSteps(mergedSteps);
      optimisticUpdatesRef.current.clear();
    } else {
      setSteps(result.steps);
    }
    
    setError(result.error);
    setLoading(false);
  }, [roadmapId]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Set up real-time subscription
  useEffect(() => {
    if (!roadmapId) return;

    // Clean up previous subscription
    if (channelRef.current) {
      roadmapService.unsubscribeFromRoadmapUpdates(channelRef.current);
    }

    // Subscribe to updates
    const channel = roadmapService.subscribeToRoadmapUpdates(roadmapId, (updatedStep) => {
      setSteps((prev) => {
        // Remove from optimistic updates if server update received
        optimisticUpdatesRef.current.delete(updatedStep.id);
        return prev.map((step) =>
          step.id === updatedStep.id ? updatedStep : step
        );
      });
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        roadmapService.unsubscribeFromRoadmapUpdates(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roadmapId]);

  const updateStepStatus = useCallback(
    async (stepId: string, status: StepStatus) => {
      // Optimistic update
      setSteps((prev) => {
        const updatedStep = prev.find((s) => s.id === stepId);
        if (!updatedStep) return prev;

        const optimisticStep: CareStep = {
          ...updatedStep,
          status,
          updated_at: new Date().toISOString(),
          completed_date:
            status === 'completed' ? new Date().toISOString() : updatedStep.completed_date,
        };

        optimisticUpdatesRef.current.set(stepId, optimisticStep);

        return prev.map((step) => (step.id === stepId ? optimisticStep : step));
      });

      // Server update
      const result = await roadmapService.updateStepStatus(stepId, status);
      
      if (result.error) {
        // Revert optimistic update on error
        setSteps((prev) => {
          const originalStep = prev.find((s) => s.id === stepId);
          if (!originalStep) return prev;
          
          optimisticUpdatesRef.current.delete(stepId);
          
          // Revert to previous state (refetch to be safe)
          fetchSteps();
          return prev;
        });
        setError(result.error);
      } else if (result.step) {
        // Server confirmed, remove from optimistic updates
        optimisticUpdatesRef.current.delete(stepId);
        setSteps((prev) =>
          prev.map((step) => (step.id === stepId ? result.step! : step))
        );
      }
    },
    [fetchSteps]
  );

  const markComplete = useCallback(
    async (stepId: string) => {
      await updateStepStatus(stepId, 'completed');
    },
    [updateStepStatus]
  );

  return {
    steps,
    loading,
    error,
    updateStepStatus,
    markComplete,
    refetch: fetchSteps,
  };
}

