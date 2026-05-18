import { useTranslation } from "react-i18next";
import type { ActiveTimer } from "../types";

interface IdleDialogProps {
  timer: ActiveTimer;
  idleStartedAt: Date;
  idleDurationSeconds: number;
  onContinue: () => void;
  onStopAtIdleStart: () => void;
  onStopNow: () => void;
  onStopAndStartNew: () => void;
  isProcessing: boolean;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${totalSeconds}s`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IdleDialog({
  timer,
  idleStartedAt,
  idleDurationSeconds,
  onContinue,
  onStopAtIdleStart,
  onStopNow,
  onStopAndStartNew,
  isProcessing,
}: IdleDialogProps) {
  const { t } = useTranslation();
  const btnBase =
    "w-full rounded-md px-3 py-2 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed";

  const idleTime = formatTime(idleStartedAt);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-3 w-full max-w-[320px] rounded-xl bg-white dark:bg-[#222] shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <svg
              className="h-4 w-4 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
              {t("idle.youWereIdle")}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {formatDuration(idleDurationSeconds)} {t("common.since", { time: idleTime })}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-md bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("idle.activeTimer")}
          </p>
          <p className="text-[12px] font-medium text-gray-900 dark:text-gray-100 truncate">
            {timer.project}
            <span className="text-gray-400 dark:text-gray-500">
              {" "}
              — {timer.activity}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={onContinue}
            disabled={isProcessing}
            className={`${btnBase} bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]`}
          >
            {t("idle.continueKeep")}
          </button>
          <button
            onClick={onStopAtIdleStart}
            disabled={isProcessing}
            className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            {t("idle.stopAt", { time: idleTime })}
          </button>
          <button
            onClick={onStopNow}
            disabled={isProcessing}
            className={`${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`}
          >
            {t("idle.stopNow")}
          </button>
          <button
            onClick={onStopAndStartNew}
            disabled={isProcessing}
            className={`${btnBase} text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {t("idle.stopAtAndNew", { time: idleTime })}
          </button>
        </div>
      </div>
    </div>
  );
}
