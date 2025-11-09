/**
 * React hook for roadmap data with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as roadmapService from '@/lib/roadmap';
import type { CareRoadmap, RoadmapWithSteps } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseRoadmapResult {
  roadmaps: CareRoadmap[];
  loading: boolean;
  error: roadmapService.RoadmapError | null;
  refetch: () => Promise<void>;
}

export function useRoadmaps(): UseRoadmapResult {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<CareRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<roadmapService.RoadmapError | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    if (!user) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await roadmapService.getRoadmaps(user.id);
    setRoadmaps(result.roadmaps);
    setError(result.error);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  return {
    roadmaps,
    loading,
    error,
    refetch: fetchRoadmaps,
  };
}

export interface UseRoadmapWithStepsResult {
  roadmap: RoadmapWithSteps | null;
  loading: boolean;
  error: roadmapService.RoadmapError | null;
  refetch: () => Promise<void>;
}

export function useRoadmapWithSteps(roadmapId: string | null): UseRoadmapWithStepsResult {
  const [roadmap, setRoadmap] = useState<RoadmapWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<roadmapService.RoadmapError | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchRoadmap = useCallback(async () => {
    if (!roadmapId) {
      setRoadmap(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await roadmapService.getRoadmapWithSteps(roadmapId);
    setRoadmap(result.roadmap);
    setError(result.error);
    setLoading(false);
  }, [roadmapId]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  // Set up real-time subscription
  useEffect(() => {
    if (!roadmapId) return;

    // Clean up previous subscription
    if (channelRef.current) {
      roadmapService.unsubscribeFromRoadmapUpdates(channelRef.current);
    }

    // Subscribe to updates
    const channel = roadmapService.subscribeToRoadmapUpdates(roadmapId, (updatedStep) => {
      setRoadmap((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((step) =>
            step.id === updatedStep.id ? updatedStep : step
          ),
        };
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

  return {
    roadmap,
    loading,
    error,
    refetch: fetchRoadmap,
  };
}

