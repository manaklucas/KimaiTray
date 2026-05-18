import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ActiveTimer } from "../types";

interface ActiveTimerCardProps {
  timer: ActiveTimer;
  onStop: () => void;
  isStopping?: boolean;
  multipleActive?: boolean;
  onEdit?: (
    id: number,
    payload: { description?: string; begin?: string },
  ) => void;
  isSaving?: boolean;
  saveError?: string | null;
}

function formatElapsed(seconds: number, showSeconds = true): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (!showSeconds) return `${pad(h)}:${pad(m)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatStartTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActiveTimerCard({
  timer,
  onStop,
  isStopping,
  multipleActive,
  onEdit,
  isSaving,
  saveError,
}: ActiveTimerCardProps) {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor(Date.now() / 1000) - timer.beginSeconds),
  );

  useEffect(() => {
    const tick = () =>
      setElapsed(
        Math.max(0, Math.floor(Date.now() / 1000) - timer.beginSeconds),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer.beginSeconds]);

  // ── Description editing ──
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const descRef = useRef<HTMLInputElement>(null);

  const startEditDesc = () => {
    if (!onEdit) return;
    setDescValue(timer.description);
    setEditingDesc(true);
  };

  useEffect(() => {
    if (editingDesc) descRef.current?.focus();
  }, [editingDesc]);

  const saveDesc = () => {
    setEditingDesc(false);
    if (descValue !== timer.description) {
      onEdit?.(timer.id, { description: descValue });
    }
  };

  const handleDescKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveDesc();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingDesc(false);
    }
  };

  // ── Begin time editing ──
  const [editingBegin, setEditingBegin] = useState(false);
  const [beginValue, setBeginValue] = useState("");
  const [beginError, setBeginError] = useState("");
  const beginRef = useRef<HTMLInputElement>(null);

  const startEditBegin = () => {
    if (!onEdit) return;
    setBeginValue(toDatetimeLocal(timer.beginIso));
    setBeginError("");
    setEditingBegin(true);
  };

  useEffect(() => {
    if (editingBegin) beginRef.current?.focus();
  }, [editingBegin]);

  const saveBegin = () => {
    const d = new Date(beginValue);
    if (isNaN(d.getTime())) {
      setBeginError(t("timer.invalidTime"));
      return;
    }
    if (d.getTime() > Date.now()) {
      setBeginError(t("timer.futureTime"));
      return;
    }
    setEditingBegin(false);
    setBeginError("");
    const iso = d.toISOString();
    if (iso !== timer.beginIso) {
      onEdit?.(timer.id, { begin: iso });
    }
  };

  const handleBeginKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveBegin();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingBegin(false);
      setBeginError("");
    }
  };

  // Reset editing when timer changes
  useEffect(() => {
    setEditingDesc(false);
    setEditingBegin(false);
    setBeginError("");
  }, [timer.id]);

  return (
    <div className="mx-3 mt-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
      <div className="px-3 py-2.5">
        {/* Row 1: Project + Activity + badges */}
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
          {(multipleActive || isSaving) && (
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              {multipleActive && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  {t("common.more")}
                </span>
              )}
              {isSaving && (
                <span className="text-[9px] text-emerald-500 dark:text-emerald-400 animate-pulse">
                  {t("common.saving")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Description (editable) */}
        <div className="pl-4 mb-1.5">
          {editingDesc ? (
            <input
              ref={descRef}
              type="text"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={saveDesc}
              onKeyDown={handleDescKey}
              placeholder={t("timer.addNote")}
              className="w-full text-[11px] bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded px-1.5 py-0.5 text-gray-700 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          ) : (
            <p
              onClick={startEditDesc}
              className={`text-[11px] truncate ${
                onEdit
                  ? "cursor-text hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 rounded px-1 -mx-1 transition-colors"
                  : ""
              } ${
                timer.description
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-gray-300 dark:text-gray-600 italic"
              }`}
            >
              {timer.description || t("timer.addNote")}
            </p>
          )}
        </div>

        {/* Row 3: Elapsed + start time + stop */}
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-lg font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 tracking-tight shrink-0">
              {formatElapsed(elapsed)}
            </span>
            {editingBegin ? (
              <div className="flex flex-col min-w-0">
                <input
                  ref={beginRef}
                  type="datetime-local"
                  value={beginValue}
                  onChange={(e) => {
                    setBeginValue(e.target.value);
                    setBeginError("");
                  }}
                  onBlur={saveBegin}
                  onKeyDown={handleBeginKey}
                  className="text-[10px] bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded px-1 py-0.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 w-[140px]"
                />
                {beginError && (
                  <span className="text-[9px] text-red-500 mt-0.5">
                    {beginError}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={startEditBegin}
                disabled={!onEdit}
                className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:hover:text-gray-400 dark:disabled:hover:text-gray-500 shrink-0"
              >
                {t("common.since", { time: formatStartTime(timer.beginIso) })}
              </button>
            )}
          </div>
          <button
            onClick={onStop}
            disabled={isStopping}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md shrink-0 ml-2
              bg-red-500/10 text-red-600 dark:text-red-400
              hover:bg-red-500/20 active:bg-red-500/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          >
            {isStopping ? t("tray.stopping") : t("timer.stopTimer")}
          </button>
        </div>

        {/* Save error */}
        {saveError && (
          <p className="pl-4 mt-1.5 text-[10px] text-red-500 dark:text-red-400 truncate">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}

export { formatElapsed };
