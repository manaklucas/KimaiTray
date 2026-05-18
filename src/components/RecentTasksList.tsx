import { useTranslation } from "react-i18next";
import type { RecentTask } from "../types";
import RecentTaskItem from "./RecentTaskItem";

interface RecentTasksListProps {
  tasks: RecentTask[];
  onStart: (task: RecentTask) => void;
  isLoading?: boolean;
  startingKey?: string | null;
  disabled?: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="px-2.5 py-1.5 flex items-center gap-2.5 animate-pulse">
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-1">
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-2 w-16 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export default function RecentTasksList({
  tasks,
  onStart,
  isLoading,
  startingKey,
  disabled,
}: RecentTasksListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="mt-1.5">
        <div className="px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {t("tray.recentTasks")}
          </span>
        </div>
        <div className="px-1.5 pb-1">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (tasks.length === 0) return null;

  return (
    <div className="mt-1.5">
      <div className="px-3 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {t("tray.recentTasks")}
        </span>
      </div>
      <div className="px-1.5 pb-1">
        {tasks.map((task) => (
          <RecentTaskItem
            key={task.key}
            task={task}
            onStart={onStart}
            isStarting={startingKey === task.key}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
