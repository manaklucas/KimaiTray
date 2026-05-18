import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import HeaderStatus from "../components/HeaderStatus";
import ActiveTimerCard from "../components/ActiveTimerCard";
import EmptyTimerState from "../components/EmptyTimerState";
import RecentTasksList from "../components/RecentTasksList";
import PopupFooterActions from "../components/PopupFooterActions";
import NewTaskForm from "../components/NewTaskForm";
import IdleDialog from "../components/IdleDialog";
import { useKimaiClient } from "../hooks/useKimaiClient";
import { useActiveTimer } from "../hooks/useActiveTimer";
import { useRecentTasks } from "../hooks/useRecentTasks";
import { useStartTask } from "../hooks/useStartTask";
import type { StartTaskPayload } from "../hooks/useStartTask";
import { useEditTimer } from "../hooks/useEditTimer";
import { useIdleDetection } from "../hooks/useIdleDetection";
import { setTrayTooltip, setTrayTitle, setTrayIcon } from "../api/trayApi";
import { updateTimesheet, stopTimesheet } from "../api/timesheetApi";
import { formatElapsed } from "../components/ActiveTimerCard";
import type { RecentTask } from "../types";

export default function TrayPopup() {
  const [showNewTask, setShowNewTask] = useState(false);
  const [idleProcessing, setIdleProcessing] = useState(false);

  const { client, isConfigured, refreshInterval, baseUrl, idleSettings, traySettings } =
    useKimaiClient();
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

  const {
    idleState,
    idleStartedAt,
    idleDurationSeconds,
    dismissIdle,
  } = useIdleDetection(
    idleSettings.enableIdleDetection,
    idleSettings.idleThresholdMinutes,
    !!timer,
  );

  // Send notification when user returns from idle
  useEffect(() => {
    if (idleState !== "returned" || !idleSettings.showIdleNotification) return;
    import("@tauri-apps/plugin-notification").then(({ sendNotification }) => {
      const mins = Math.round(idleDurationSeconds / 60);
      sendNotification({
        title: "KimaiMate",
        body: `You were idle for ${mins} min while tracking "${timer?.project ?? "timer"}"`,
      });
    }).catch(() => {});
  }, [idleState]);

  // Auto-handle idle for non-"ask" actions
  useEffect(() => {
    if (idleState !== "returned" || idleSettings.idleAction === "ask") return;
    if (!client || !timer) return;

    const handle = async () => {
      setIdleProcessing(true);
      try {
        if (idleSettings.idleAction === "continue") {
          // Do nothing, just dismiss
        } else if (idleSettings.idleAction === "stop") {
          await stopTimesheet(client, timer.id);
        } else if (idleSettings.idleAction === "discard" && idleStartedAt) {
          await updateTimesheet(client, timer.id, {
            end: idleStartedAt.toISOString(),
          });
        }
      } catch {
        // Ignore errors for auto-actions
      } finally {
        setIdleProcessing(false);
        dismissIdle();
      }
    };
    handle();
  }, [idleState, idleSettings.idleAction]);

  const handleIdleContinue = useCallback(() => {
    dismissIdle();
  }, [dismissIdle]);

  const handleIdleStopAtStart = useCallback(async () => {
    if (!client || !timer || !idleStartedAt) return;
    setIdleProcessing(true);
    try {
      await updateTimesheet(client, timer.id, {
        end: idleStartedAt.toISOString(),
      });
    } catch {
      // fallback: just stop now
      try { await stopTimesheet(client, timer.id); } catch {}
    } finally {
      setIdleProcessing(false);
      dismissIdle();
    }
  }, [client, timer, idleStartedAt, dismissIdle]);

  const handleIdleStopNow = useCallback(async () => {
    if (!client || !timer) return;
    setIdleProcessing(true);
    try {
      await stopTimesheet(client, timer.id);
    } catch {}
    setIdleProcessing(false);
    dismissIdle();
  }, [client, timer, dismissIdle]);

  const handleIdleStopAndNew = useCallback(async () => {
    if (!client || !timer || !idleStartedAt) return;
    setIdleProcessing(true);
    try {
      await updateTimesheet(client, timer.id, {
        end: idleStartedAt.toISOString(),
      });
    } catch {
      try { await stopTimesheet(client, timer.id); } catch {}
    }
    setIdleProcessing(false);
    dismissIdle();
    setShowNewTask(true);
  }, [client, timer, idleStartedAt, dismissIdle]);

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

  // Update tray icon state
  useEffect(() => {
    if (status === "error" || status === "offline") {
      setTrayIcon("error");
    } else if (timer) {
      setTrayIcon("running");
    } else {
      setTrayIcon("idle");
    }
  }, [status, !!timer]);

  // Update tray tooltip and menu bar title
  useEffect(() => {
    if (!timer) {
      setTrayTooltip("KimaiMate");
      setTrayTitle("");
      return;
    }
    const tick = () => {
      const secs = Math.max(
        0,
        Math.floor(Date.now() / 1000) - timer.beginSeconds,
      );
      const elapsed = formatElapsed(secs);

      // Tooltip — always shows full info
      setTrayTooltip(`${timer.project} — ${timer.activity} — ${elapsed}`);

      // Menu bar title (macOS) — driven by settings
      const { menuBarLabelStyle, showElapsedInTray, showTaskNameInTray } = traySettings;

      if (menuBarLabelStyle === "hidden") {
        setTrayTitle("");
        return;
      }

      const parts: string[] = [];

      if (showTaskNameInTray) {
        if (menuBarLabelStyle === "project") {
          parts.push(timer.project);
        } else if (menuBarLabelStyle === "activity") {
          parts.push(timer.activity);
        } else {
          parts.push(timer.project);
        }
      }

      if (showElapsedInTray) {
        parts.push(elapsed);
      }

      setTrayTitle(parts.join(" — "));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      setTrayTooltip("KimaiMate");
      setTrayTitle("");
    };
  }, [timer?.id, timer?.beginSeconds, timer?.project, timer?.activity, traySettings]);

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

  const showIdleDialog =
    idleState === "returned" &&
    idleSettings.idleAction === "ask" &&
    timer &&
    idleStartedAt;

  return (
    <div className="relative flex h-screen w-screen flex-col bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100">
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
            onOpenKimai={async () => {
              const { openUrl } = await import("@tauri-apps/plugin-opener");
              if (baseUrl) openUrl(baseUrl);
            }}
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

      {showIdleDialog && (
        <IdleDialog
          timer={timer}
          idleStartedAt={idleStartedAt}
          idleDurationSeconds={idleDurationSeconds}
          onContinue={handleIdleContinue}
          onStopAtIdleStart={handleIdleStopAtStart}
          onStopNow={handleIdleStopNow}
          onStopAndStartNew={handleIdleStopAndNew}
          isProcessing={idleProcessing}
        />
      )}
    </div>
  );
}
