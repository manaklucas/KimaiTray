import { useEffect, useState } from "react";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import HeaderStatus from "../components/HeaderStatus";
import ActiveTimerCard from "../components/ActiveTimerCard";
import EmptyTimerState from "../components/EmptyTimerState";
import RecentTasksList from "../components/RecentTasksList";
import PopupFooterActions from "../components/PopupFooterActions";
import NewTaskForm from "../components/NewTaskForm";
import { useKimaiClient } from "../hooks/useKimaiClient";
import { useActiveTimer } from "../hooks/useActiveTimer";
import { useRecentTasks } from "../hooks/useRecentTasks";
import { useStartTask } from "../hooks/useStartTask";
import type { StartTaskPayload } from "../hooks/useStartTask";
import { useEditTimer } from "../hooks/useEditTimer";
import { setTrayTooltip } from "../api/trayApi";
import { formatElapsed } from "../components/ActiveTimerCard";
import type { RecentTask } from "../types";

export default function TrayPopup() {
  const [showNewTask, setShowNewTask] = useState(false);

  const { client, isConfigured, refreshInterval } = useKimaiClient();
  const {
    timer,
    multipleActive,
    status,
    errorMessage,
    isStopping,
    stopTimer,
  } = useActiveTimer(client, isConfigured, refreshInterval);

  const { tasks, isLoading: tasksLoading } = useRecentTasks(
    client,
    isConfigured,
  );

  const { startTask, startingKey, switchError, dismissError, isStarting } =
    useStartTask(client, timer?.id ?? null, () => setShowNewTask(false));

  const { editTimer, isSaving, saveError } = useEditTimer(client);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showNewTask) {
          setShowNewTask(false);
        } else {
          getCurrentWindow().hide();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showNewTask]);

  useEffect(() => {
    if (!timer) {
      setTrayTooltip("KimaiMate");
      return;
    }
    const tick = () => {
      const secs = Math.max(
        0,
        Math.floor(Date.now() / 1000) - timer.beginSeconds,
      );
      setTrayTooltip(`${timer.project} — ${formatElapsed(secs)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      setTrayTooltip("KimaiMate");
    };
  }, [timer?.id, timer?.beginSeconds, timer?.project]);

  const handleStartRecent = (task: RecentTask) => {
    startTask(
      {
        projectId: task.projectId,
        activityId: task.activityId,
        label: task.project,
      },
      task.key,
    );
  };

  const handleNewTaskSubmit = (payload: StartTaskPayload) => {
    startTask(payload);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100">
      <HeaderStatus status={status} errorMessage={errorMessage} />

      {showNewTask && client ? (
        <NewTaskForm
          client={client}
          hasActiveTimer={!!timer}
          onSubmit={handleNewTaskSubmit}
          onCancel={() => setShowNewTask(false)}
          isSubmitting={isStarting}
        />
      ) : (
        <>
          {status === "loading" ? (
            <EmptyTimerState variant="loading" />
          ) : status === "unconfigured" ? (
            <EmptyTimerState variant="unconfigured" />
          ) : timer ? (
            <ActiveTimerCard
              timer={timer}
              onStop={stopTimer}
              isStopping={isStopping}
              multipleActive={multipleActive}
              onEdit={editTimer}
              isSaving={isSaving}
              saveError={saveError}
            />
          ) : (
            <EmptyTimerState />
          )}

          {switchError && (
            <div className="mx-3 mt-1.5 flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 px-2.5 py-2">
              <span className="text-[11px] text-red-600 dark:text-red-400 flex-1 leading-snug">
                {switchError}
              </span>
              <button
                onClick={dismissError}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 text-xs leading-none shrink-0 p-0.5"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mx-3 mt-2 border-t border-gray-100 dark:border-gray-800" />

          <RecentTasksList
            tasks={tasks}
            onStart={handleStartRecent}
            isLoading={status !== "unconfigured" && tasksLoading}
            startingKey={startingKey}
            disabled={isStarting || isStopping}
          />

          <PopupFooterActions
            onNewTask={() => setShowNewTask(true)}
            onOpenKimai={() => {}}
            onSettings={async () => {
              const w = await Window.getByLabel("settings");
              if (w) {
                await w.show();
                await w.setFocus();
              }
            }}
          />
        </>
      )}
    </div>
  );
}
