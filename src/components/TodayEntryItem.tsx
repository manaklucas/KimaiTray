import { useTranslation } from "react-i18next";
import type { TodayEntry } from "../types";
import TagsList from "./TagsList";
import { formatTime, formatDuration } from "../utils/time";

interface TodayEntryItemProps {
  entry: TodayEntry;
}

export default function TodayEntryItem({ entry }: TodayEntryItemProps) {
  const { t } = useTranslation();

  const duration = entry.isRunning
    ? Math.max(0, Math.floor((Date.now() - new Date(entry.beginIso).getTime()) / 1000))
    : (entry.duration ?? 0);

  const subtitle = [entry.customer, entry.description]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`px-2.5 py-1.5 rounded-md transition-colors ${
        entry.isRunning
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30"
          : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Time range */}
        <div className="shrink-0 w-[72px] text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
          <span>{formatTime(entry.beginIso)}</span>
          <span className="mx-0.5">–</span>
          {entry.isRunning ? (
            <span className="text-emerald-500 dark:text-emerald-400 font-medium">
              {t("common.now")}
            </span>
          ) : entry.endIso ? (
            <span>{formatTime(entry.endIso)}</span>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Color dot */}
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            entry.isRunning ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: entry.projectColor }}
        />

        {/* Project + Activity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
              {entry.project}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate shrink-0">
              {entry.activity}
            </span>
          </div>
        </div>

        {/* Duration + billable */}
        <div className="flex items-center gap-1 shrink-0">
          {entry.billable && (
            <span className="text-[8px] text-emerald-500 dark:text-emerald-400 font-bold">$</span>
          )}
          <span
            className={`text-[10px] tabular-nums font-medium ${
              entry.isRunning
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Subtitle row */}
      {(subtitle || entry.tags.length > 0) && (
        <div className="ml-[88px] mt-0.5 flex items-center gap-2 min-w-0">
          {subtitle && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              {subtitle}
            </span>
          )}
          {entry.tags.length > 0 && (
            <TagsList tags={entry.tags} maxVisible={2} />
          )}
        </div>
      )}
    </div>
  );
}
