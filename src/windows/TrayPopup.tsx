import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import HeaderStatus from "../components/HeaderStatus";
import ActiveTimerCard from "../components/ActiveTimerCard";
import EmptyTimerState from "../components/EmptyTimerState";
import RecentTasksList from "../components/RecentTasksList";
import PopupFooterActions from "../components/PopupFooterActions";
import { mockActiveTimer, mockRecentTasks, mockTodayTotal } from "../mock/data";
import type { ActiveTimer, RecentTask } from "../types";

export default function TrayPopup() {
  const [timer, setTimer] = useState<ActiveTimer | null>(mockActiveTimer);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        getCurrentWindow().hide();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleStop = () => setTimer(null);

  const handleStart = (task: RecentTask) => {
    setTimer({
      id: task.id,
      project: task.project,
      projectColor: task.projectColor,
      activity: task.activity,
      description: task.description,
      beginSeconds: Math.floor(Date.now() / 1000),
    });
  };

  const handleNewTask = () => {
    /* TODO: open new task form */
  };

  const handleOpenKimai = () => {
    /* TODO: open Kimai in browser */
  };

  const handleSettings = () => {
    /* TODO: show settings window */
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100">
      <HeaderStatus connected={true} todayTotal={mockTodayTotal} />

      {timer ? (
        <ActiveTimerCard timer={timer} onStop={handleStop} />
      ) : (
        <EmptyTimerState />
      )}

      <div className="mx-3 mt-2 border-t border-gray-100 dark:border-gray-800" />

      <RecentTasksList tasks={mockRecentTasks} onStart={handleStart} />

      <PopupFooterActions
        onNewTask={handleNewTask}
        onOpenKimai={handleOpenKimai}
        onSettings={handleSettings}
      />
    </div>
  );
}
