import type { RecentTask } from "../types";
import RecentTaskItem from "./RecentTaskItem";

interface RecentTasksListProps {
  tasks: RecentTask[];
  onStart: (task: RecentTask) => void;
}

export default function RecentTasksList({ tasks, onStart }: RecentTasksListProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="mt-1.5 flex-1 min-h-0 flex flex-col">
      <div className="px-3 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Recent
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-1">
        {tasks.map((task) => (
          <RecentTaskItem key={task.id} task={task} onStart={onStart} />
        ))}
      </div>
    </div>
  );
}
