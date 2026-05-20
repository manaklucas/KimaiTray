import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { AppSettings } from "../types";
import i18n from "../shared/i18n";
import { resolveLanguage, type LanguageSetting } from "../shared/i18n";
import { setTrayClickActions, setDisplayMode } from "../api/trayApi";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  SectionTitle,
  Select,
  Toggle,
} from "./Controls";

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "sk", label: "Slovensky" },
  { value: "en", label: "English" },
  { value: "cs", label: "Česky" },
  { value: "de", label: "Deutsch" },
  { value: "uk", label: "Українська" },
  { value: "system", label: "" },
];

export default function GeneralSection({ settings, update }: Props) {
  const { t } = useTranslation();
  const [autostart, setAutostart] = useState(settings.launchAtLogin);

  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => {});
  }, []);

  const toggleAutostart = useCallback(async (v: boolean) => {
    try {
      if (v) {
        await enable();
      } else {
        await disable();
      }
      setAutostart(v);
      update("launchAtLogin", v);
    } catch {
      // Autostart not available
    }
  }, [update]);

  const handleLanguageChange = useCallback(
    (value: string) => {
      const lang = value as LanguageSetting;
      update("language", lang);
      i18n.changeLanguage(resolveLanguage(lang));
    },
    [update],
  );

  const languageOptions = LANGUAGE_OPTIONS.map((opt) =>
    opt.value === "system"
      ? { ...opt, label: t("settings.systemLanguage") }
      : opt,
  );

  return (
    <div>
      <SectionTitle>{t("general.title")}</SectionTitle>
      <SectionDescription>
        {t("general.description")}
      </SectionDescription>

      <FieldGroup label={t("settings.language")} description={t("settings.languageDescription")} horizontal>
        <Select
          value={settings.language}
          onChange={handleLanguageChange}
          options={languageOptions}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.launchAtLogin")} description={t("general.launchAtLoginDescription")} horizontal>
        <Toggle
          checked={autostart}
          onChange={toggleAutostart}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.refreshInterval")} description={t("general.refreshIntervalDescription")} horizontal>
        <Select
          value={settings.refreshInterval}
          onChange={(v) => update("refreshInterval", Number(v))}
          options={[
            { value: 15, label: t("general.seconds_15") },
            { value: 30, label: t("general.seconds_30") },
            { value: 60, label: t("general.minute_1") },
            { value: 120, label: t("general.minutes_2") },
            { value: 300, label: t("general.minutes_5") },
            { value: 600, label: t("general.minutes_10") },
          ]}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.openKimaiInBrowser")} description={t("general.openKimaiInBrowserDescription")} horizontal>
        <Toggle
          checked={settings.openKimaiInBrowser}
          onChange={(v) => update("openKimaiInBrowser", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.trayLeftClick")} description={t("general.trayLeftClickDescription")} horizontal>
        <Select
          value={settings.trayLeftClickAction}
          onChange={(v) => {
            const val = v as AppSettings["trayLeftClickAction"];
            update("trayLeftClickAction", val);
            setTrayClickActions(val, settings.trayRightClickAction);
          }}
          options={[
            { value: "popup", label: t("general.trayActionTogglePopup") },
            { value: "nothing", label: t("general.trayActionDoNothing") },
          ]}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.trayRightClick")} description={t("general.trayRightClickDescription")} horizontal>
        <Select
          value={settings.trayRightClickAction}
          onChange={(v) => {
            const val = v as AppSettings["trayRightClickAction"];
            update("trayRightClickAction", val);
            setTrayClickActions(settings.trayLeftClickAction, val);
          }}
          options={[
            { value: "menu", label: t("general.trayActionShowMenu") },
            { value: "popup", label: t("general.trayActionTogglePopup") },
          ]}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.displayMode")} description={t("general.displayModeDescription")}>
        <div className="flex gap-2 mt-1">
          {([
            { value: "tray" as const, label: t("general.displayModeTray"), desc: t("general.displayModeTrayDescription") },
            { value: "detached" as const, label: t("general.displayModeDetached"), desc: t("general.displayModeDetachedDescription") },
          ]).map((opt) => {
            const active = settings.displayMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  update("displayMode", opt.value);
                  setDisplayMode(opt.value);
                }}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                  ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div className={`h-10 w-full rounded-md border flex items-center justify-center ${
                  active
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                }`}>
                  {opt.value === "tray" ? (
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18v2H3zM7 10h10v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18" />
                      <circle cx="5.5" cy="7" r="0.5" fill="currentColor" />
                      <circle cx="7.5" cy="7" r="0.5" fill="currentColor" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border shrink-0
                      ${
                        active
                          ? "border-[var(--accent)]"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </span>
                  <span className="text-[12px] text-gray-600 dark:text-gray-400">
                    {opt.label}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </FieldGroup>
    </div>
  );
}
