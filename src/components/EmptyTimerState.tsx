export default function EmptyTimerState() {
  return (
    <div className="mx-3 mt-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 px-3 py-4">
      <div className="flex flex-col items-center gap-1">
        <svg
          className="h-5 w-5 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
          />
        </svg>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          No active timer
        </span>
        <span className="text-[10px] text-gray-300 dark:text-gray-600">
          Start a recent task or create new
        </span>
      </div>
    </div>
  );
}
