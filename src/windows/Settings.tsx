import { type ReactNode, useState } from "react";
import type { SettingsSection } from "../types";
import { useSettings } from "../settings/useSettings";
import { useAppearance } from "../hooks/useAppearance";
import ConnectionSection from "../settings/ConnectionSection";
import GeneralSection from "../settings/GeneralSection";
import TimerSection from "../settings/TimerSection";
import IdleDetectionSection from "../settings/IdleDetectionSection";
import AppearanceSection from "../settings/AppearanceSection";
import AboutSection from "../settings/AboutSection";

const NAV_ITEMS: { id: SettingsSection; label: string; icon: ReactNode }[] = [
  {
    id: "connection",
    label: "Connection",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.798" />
      </svg>
    ),
  },
  {
    id: "general",
    label: "General",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    id: "timer",
    label: "Timer",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
  },
  {
    id: "idle",
    label: "Idle Detection",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75 9.75 9.75 0 018.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25 9.75 9.75 0 0012.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    id: "about",
    label: "About",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

export default function Settings() {
  const [section, setSection] = useState<SettingsSection>("connection");
  const {
    settings,
    token,
    update,
    loaded,
    saveConnection,
    removeConnection,
    activateConnection,
  } = useSettings();
  useAppearance();

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <span className="text-[12px] text-gray-400">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <nav className="flex w-[200px] shrink-0 flex-col border-r border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-[#141414] pt-4 pb-3">
        <div className="px-4 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Settings
          </span>
        </div>

        <div className="flex-1 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors
                focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
                ${
                  section === item.id
                    ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
            >
              <span
                className={
                  section === item.id
                    ? "text-[var(--accent)]"
                    : "text-gray-400 dark:text-gray-500"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="px-4 text-[10px] text-gray-300 dark:text-gray-600">
          v0.1.0
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-lg">
          {section === "connection" && (
            <ConnectionSection
              settings={settings}
              token={token}
              saveConnection={saveConnection}
              removeConnection={removeConnection}
              activateConnection={activateConnection}
            />
          )}
          {section === "general" && (
            <GeneralSection settings={settings} update={update} />
          )}
          {section === "timer" && (
            <TimerSection settings={settings} update={update} />
          )}
          {section === "idle" && (
            <IdleDetectionSection settings={settings} update={update} />
          )}
          {section === "appearance" && (
            <AppearanceSection settings={settings} update={update} />
          )}
          {section === "about" && <AboutSection />}
        </div>
      </main>
    </div>
  );
}
