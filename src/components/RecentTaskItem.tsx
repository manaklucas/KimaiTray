import type { RecentTask } from "../types";

interface RecentTaskItemProps {
  task: RecentTask;
  onStart: (task: RecentTask) => void;
}

export default function RecentTaskItem({ task, onStart }: RecentTaskItemProps) {
  return (
    <button
      onClick={() => onStart(task)}
      className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5
        text-left transition-colors
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800
        focus-visible:ring-1 focus-visible:ring-blue-400"
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: task.projectColor }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {task.project}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
            {task.activity}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
          {task.description}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-gray-300 dark:text-gray-600">
          {task.lastUsed}
        </span>
        <svg
          className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600
            group-hover:text-emerald-500 dark:group-hover:text-emerald-400
            transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}
