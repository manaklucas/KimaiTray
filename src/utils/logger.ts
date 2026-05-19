type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  const configured = (import.meta.env.VITE_LOG_LEVEL ?? "info") as LogLevel;
  return LEVELS[level] >= (LEVELS[configured] ?? 1);
}

let mod: typeof import("@tauri-apps/plugin-log") | null = null;

async function getTauriLog() {
  if (!mod) mod = await import("@tauri-apps/plugin-log");
  return mod;
}

function log(level: LogLevel, msg: string) {
  if (!shouldLog(level)) return;
  getTauriLog()
    .then((l) => l[level](msg))
    .catch(() => console[level](msg));
}

export const logger = {
  debug: (msg: string) => log("debug", msg),
  info: (msg: string) => log("info", msg),
  warn: (msg: string) => log("warn", msg),
  error: (msg: string) => log("error", msg),
};
