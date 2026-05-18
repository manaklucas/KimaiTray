import { useEffect, useState } from "react";
import type { ActiveTimer } from "../types";

interface ActiveTimerCardProps {
  timer: ActiveTimer;
  onStop: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function ActiveTimerCard({ timer, onStop }: ActiveTimerCardProps) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor(Date.now() / 1000) - timer.beginSeconds
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor(Date.now() / 1000) - timer.beginSeconds);
    }, 1000);
    return () => clearInterval(id);
  }, [timer.beginSeconds]);

  return (
    <div className="mx-3 mt-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: timer.projectColor }}
          />
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {timer.project}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {timer.activity}
          </span>
        </div>

        {timer.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate pl-4 mb-1.5">
            {timer.description}
          </p>
        )}

        <div className="flex items-center justify-between pl-4">
          <span className="text-lg font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatElapsed(elapsed)}
          </span>
          <button
            onClick={onStop}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md
              bg-red-500/10 text-red-600 dark:text-red-400
              hover:bg-red-500/20 active:bg-red-500/30
              transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
