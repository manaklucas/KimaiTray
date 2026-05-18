interface HeaderStatusProps {
  connected: boolean;
  todayTotal: string;
}

export default function HeaderStatus({ connected, todayTotal }: HeaderStatusProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            connected
              ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        />
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
          KimaiMate
        </span>
      </div>
      <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
        Today: {todayTotal}
      </span>
    </header>
  );
}
