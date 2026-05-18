import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { KimaiClient } from "../api/kimaiClient";
import { stopTimesheet, startTimesheet } from "../api/timesheetApi";
import { serializeKimaiTags } from "../api/tagUtils";
import {
  loadPausedTimer,
  savePausedTimer,
  clearPausedTimer,
  type PausedTimerData,
} from "../api/pauseStore";
import type { ActiveTimer } from "../types";

interface UsePauseTimerResult {
  pausedTimer: PausedTimerData | null;
  isPaused: boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  fullStop: () => void;
  isPausing: boolean;
  isResuming: boolean;
  isStopping: boolean;
  pauseError: string | null;
  dismissPauseError: () => void;
}

export function usePauseTimer(
  client: KimaiClient | null,
  timer: ActiveTimer | null,
  baseUrl: string,
): UsePauseTimerResult {
  const qc = useQueryClient();
  const [pausedTimer, setPausedTimer] = useState<PausedTimerData | null>(null);
  const [pauseError, setPauseError] = useState<string | null>(null);
  const loaded = useRef(false);
  const pausedTimerRef = useRef(pausedTimer);
  pausedTimerRef.current = pausedTimer;

  useEffect(() => {
    loadPausedTimer().then((data) => {
      if (data && data.baseUrl === baseUrl) {
        setPausedTimer(data);
      } else if (data) {
        clearPausedTimer();
      }
      loaded.current = true;
    });
  }, [baseUrl]);

  // API running timer takes precedence over local paused state.
  // Only reacts to timer?.id changes — not pausedTimer — to avoid
  // clearing pause state before the query invalidation lands.
  useEffect(() => {
    if (!loaded.current) return;
    if (timer && pausedTimerRef.current) {
      clearPausedTimer();
      setPausedTimer(null);
    }
  }, [timer?.id]);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["active-timesheets"] });
    qc.invalidateQueries({ queryKey: ["recent-timesheets"] });
    qc.invalidateQueries({ queryKey: ["today-timesheets"] });
  }, [qc]);

  const pauseMut = useMutation({
    mutationFn: async (activeTimer: ActiveTimer) => {
      await stopTimesheet(client!, activeTimer.id);
      const data: PausedTimerData = {
        baseUrl,
        lastTimesheetId: activeTimer.id,
        projectId: activeTimer.projectId,
        activityId: activeTimer.activityId,
        project: activeTimer.project,
        projectColor: activeTimer.projectColor,
        activity: activeTimer.activity,
        description: activeTimer.description,
        tags: activeTimer.tags,
        pausedAt: new Date().toISOString(),
      };
      await savePausedTimer(data);
      return data;
    },
    onSuccess: (data) => {
      setPausedTimer(data);
      setPauseError(null);
      invalidate();
    },
    onError: (err: Error) => {
      setPauseError(err.message);
    },
  });

  const resumeMut = useMutation({
    mutationFn: async (data: PausedTimerData) => {
      const result = await startTimesheet(client!, {
        project: data.projectId,
        activity: data.activityId,
        description: data.description || undefined,
        tags:
          data.tags.length > 0 ? serializeKimaiTags(data.tags) : undefined,
        begin: new Date().toISOString(),
      });
      await clearPausedTimer();
      return result;
    },
    onSuccess: () => {
      setPausedTimer(null);
      setPauseError(null);
      invalidate();
    },
    onError: (err: Error) => {
      setPauseError(err.message);
    },
  });

  const fullStopMut = useMutation({
    mutationFn: async ({
      timerId,
      hasRunning,
    }: {
      timerId?: number;
      hasRunning: boolean;
    }) => {
      if (hasRunning && timerId) {
        await stopTimesheet(client!, timerId);
      }
      await clearPausedTimer();
    },
    onSuccess: () => {
      setPausedTimer(null);
      setPauseError(null);
      invalidate();
    },
    onError: (err: Error) => {
      setPauseError(err.message);
    },
  });

  const pauseTimer = useCallback(() => {
    if (!client || !timer || pauseMut.isPending) return;
    setPauseError(null);
    pauseMut.mutate(timer);
  }, [client, timer, pauseMut]);

  const resumeTimer = useCallback(() => {
    if (!client || !pausedTimer || resumeMut.isPending) return;
    setPauseError(null);
    resumeMut.mutate(pausedTimer);
  }, [client, pausedTimer, resumeMut]);

  const fullStop = useCallback(() => {
    if (fullStopMut.isPending) return;
    setPauseError(null);
    fullStopMut.mutate({
      timerId: timer?.id,
      hasRunning: !!timer,
    });
  }, [timer, fullStopMut]);

  const dismissPauseError = useCallback(() => setPauseError(null), []);

  const isPaused = !timer && pausedTimer !== null;

  return {
    pausedTimer: isPaused ? pausedTimer : null,
    isPaused,
    pauseTimer,
    resumeTimer,
    fullStop,
    isPausing: pauseMut.isPending,
    isResuming: resumeMut.isPending,
    isStopping: fullStopMut.isPending,
    pauseError,
    dismissPauseError,
  };
}
