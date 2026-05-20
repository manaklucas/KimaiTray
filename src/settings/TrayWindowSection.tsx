import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import { setTrayClickActions, setDisplayMode } from "../api/trayApi";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  SectionTitle,
  Select,
} from "./Controls";

const isMac = navigator.platform.toUpperCase().includes("MAC");
const isLinux = navigator.platform.toUpperCase().includes("LINUX");

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

function TrayDot() {
  return (
    <span
      className="inline-block h-[8px] w-[8px] rounded-full bg-emerald-500 shrink-0"
      style={{ boxShadow: "0 0 4px rgba(16,185,129,0.4)" }}
    />
  );
}

export default function TrayWindowSection({ settings, update }: Props) {
  const { t } = useTranslation();

  const menuBarOptions: {
    value: AppSettings["menuBarLabelStyle"];
    label: string;
    previewWithSeconds: string;
    previewWithoutSeconds: string;
  }[] = [
    { value: "timer", label: t("timerSettings.elapsedTime"), previewWithSeconds: "1:23:45", previewWithoutSeconds: "1:23" },
    { value: "project", label: t("timerSettings.projectName"), previewWithSeconds: "Acme Corp", previewWithoutSeconds: "Acme Corp" },
    { value: "activity", label: t("timerSettings.activityName"), previewWithSeconds: "Development", previewWithoutSeconds: "Development" },
    { value: "hidden", label: t("timerSettings.iconOnly"), previewWithSeconds: "", previewWithoutSeconds: "" },
  ];

  return (
    <div>
      <SectionTitle>{t("traySettings.title")}</SectionTitle>
      <SectionDescription>
        {t("traySettings.description")}
      </SectionDescription>

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

      <Divider />

      <FieldGroup label={t("general.trayLeftClick")} description={isLinux ? t("traySettings.linuxOnly") : t("general.trayLeftClickDescription")} horizontal>
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
          disabled={isLinux}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("general.trayRightClick")} description={isLinux ? t("traySettings.linuxOnly") : t("general.trayRightClickDescription")} horizontal>
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
          disabled={isLinux}
        />
      </FieldGroup>

      <Divider />

      <div className={!isMac ? "opacity-50 pointer-events-none" : ""}>
        <div className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t("timerSettings.menuBarLabel")}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
          {isMac
            ? t("timerSettings.menuBarLabelDescription")
            : t("traySettings.macOnly")}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {menuBarOptions.map((opt) => {
            const active = settings.menuBarLabelStyle === opt.value;
            const preview = settings.showSecondsInTimer
              ? opt.previewWithSeconds
              : opt.previewWithoutSeconds;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!isMac}
                onClick={() => update("menuBarLabelStyle", opt.value)}
                className={`relative flex flex-col items-center gap-2 rounded-lg border px-3 py-3 transition-colors text-left
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div className="flex items-center gap-1.5 h-5">
                  <TrayDot />
                  {preview && (
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                      {preview}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 w-full">
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
              </button>
            );
          })}
        </div>

        {settings.menuBarLabelStyle === "timer" && isMac && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5">
            <div>
              <div className="text-[12px] font-medium text-gray-700 dark:text-gray-300">
                {t("timerSettings.showSeconds")}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">
                {t("timerSettings.showSecondsDescription")}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showSecondsInTimer}
              onClick={() => update("showSecondsInTimer", !settings.showSecondsInTimer)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1
                ${settings.showSecondsInTimer ? "bg-[var(--accent)]" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform
                  ${settings.showSecondsInTimer ? "translate-x-[18px]" : "translate-x-[3px]"}`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
