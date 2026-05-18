import { useTranslation } from "react-i18next";
import type { PausedTimerData } from "../api/pauseStore";
import TagsList from "./TagsList";

interface PausedTimerCardProps {
  paused: PausedTimerData;
  onResume: () => void;
  onStop: () => void;
  isResuming?: boolean;
  isStopping?: boolean;
  error?: string | null;
  onDismissError?: () => void;
}

function formatPausedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PausedTimerCard({
  paused,
  onResume,
  onStop,
  isResuming,
  isStopping,
  error,
  onDismissError,
}: PausedTimerCardProps) {
  const { t } = useTranslation();
  const busy = !!isResuming || !!isStopping;

  return (
    <div className="mx-3 mt-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
      <div className="px-3 py-2.5">
        {/* Row 1: Project + Activity + Paused badge */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: paused.projectColor }}
          />
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
            {paused.project}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {paused.activity}
          </span>
          <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
            {t("pause.paused")}
          </span>
        </div>

        {/* Row 2: Description */}
        {paused.description && (
          <p className="pl-4 mb-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {paused.description}
          </p>
        )}

        {/* Row 3: Tags */}
        {paused.tags.length > 0 && (
          <div className="pl-4 mb-1.5">
            <TagsList tags={paused.tags} maxVisible={3} />
          </div>
        )}

        {/* Row 4: Paused time + buttons */}
        <div className="flex items-center justify-between pl-4">
          <span className="text-[10px] text-amber-600 dark:text-amber-400">
            {t("pause.pausedSince", { time: formatPausedAt(paused.pausedAt) })}
          </span>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={onResume}
              disabled={busy}
              title={t("pause.resume")}
              className="p-1.5 rounded-md
                bg-[var(--accent)]/10 text-[var(--accent)]
                hover:bg-[var(--accent)]/20 active:bg-[var(--accent)]/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {isResuming ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8V4z" /></svg>
              )}
            </button>
            <button
              onClick={onStop}
              disabled={busy}
              title={t("timer.stopTimer")}
              className="p-1.5 rounded-md
                bg-red-500/10 text-red-600 dark:text-red-400
                hover:bg-red-500/20 active:bg-red-500/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
            >
              {isStopping ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-500" />
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="pl-4 mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-red-500 dark:text-red-400 truncate flex-1">
              {error}
            </span>
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 text-xs leading-none shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
