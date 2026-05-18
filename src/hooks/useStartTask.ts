import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { KimaiClient } from "../api/kimaiClient";
import { KimaiApiError } from "../api/kimaiClient";
import { startTimesheet, stopTimesheet } from "../api/timesheetApi";
import { serializeKimaiTags } from "../api/tagUtils";

export interface StartTaskPayload {
  projectId: number;
  activityId: number;
  description?: string;
  tags?: string[];
  begin?: string;
  label: string;
}

class TaskSwitchError extends Error {
  stoppedExisting: boolean;
  constructor(cause: unknown, stoppedExisting: boolean) {
    super(cause instanceof KimaiApiError ? cause.message : String(cause));
    this.stoppedExisting = stoppedExisting;
  }
}

export function useStartTask(
  client: KimaiClient | null,
  activeTimerId: number | null,
  onTaskStarted?: () => void,
) {
  const qc = useQueryClient();
  const [startingKey, setStartingKey] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: StartTaskPayload) => {
      let stoppedExisting = false;

      if (activeTimerId != null) {
        await stopTimesheet(client!, activeTimerId);
        stoppedExisting = true;
      }

      try {
        return await startTimesheet(client!, {
          project: payload.projectId,
          activity: payload.activityId,
          description: payload.description,
          tags: payload.tags?.length
            ? serializeKimaiTags(payload.tags)
            : undefined,
          begin: payload.begin ?? new Date().toISOString(),
        });
      } catch (err) {
        throw new TaskSwitchError(err, stoppedExisting);
      }
    },
    onMutate: () => {
      setSwitchError(null);
    },
    onSuccess: () => {
      setStartingKey(null);
      qc.invalidateQueries({ queryKey: ["active-timesheets"] });
      qc.invalidateQueries({ queryKey: ["recent-timesheets"] });
      qc.invalidateQueries({ queryKey: ["today-timesheets"] });
      onTaskStarted?.();
    },
    onError: (err: Error, payload) => {
      setStartingKey(null);
      qc.invalidateQueries({ queryKey: ["active-timesheets"] });
      qc.invalidateQueries({ queryKey: ["recent-timesheets"] });
      qc.invalidateQueries({ queryKey: ["today-timesheets"] });

      if (err instanceof TaskSwitchError && err.stoppedExisting) {
        setSwitchError(
          `Timer stopped but "${payload.label}" failed to start: ${err.message}`,
        );
      } else if (activeTimerId != null) {
        setSwitchError(`Failed to stop current timer: ${err.message}`);
      } else {
        setSwitchError(`Failed to start "${payload.label}": ${err.message}`);
      }
    },
  });

  const startTask = useCallback(
    (payload: StartTaskPayload, trackingKey?: string) => {
      if (!client || mutation.isPending) return;
      setStartingKey(trackingKey ?? null);
      mutation.mutate(payload);
    },
    [client, mutation],
  );

  const dismissError = useCallback(() => setSwitchError(null), []);

  return {
    startTask,
    startingKey,
    switchError,
    dismissError,
    isStarting: mutation.isPending,
  };
}
