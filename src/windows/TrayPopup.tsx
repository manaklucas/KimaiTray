import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TrayPopup() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        getCurrentWindow().hide();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h1 className="text-sm font-semibold tracking-tight">KimaiMate</h1>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          No active time entries.
          <br />
          Right-click the tray icon → Settings to connect.
        </p>
      </main>

      <footer className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-700">
        KimaiMate v0.1.0
      </footer>
    </div>
  );
}
