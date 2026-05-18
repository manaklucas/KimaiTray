import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  SectionTitle,
  Toggle,
} from "./Controls";

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const accentOptions: { value: AppSettings["accentStyle"]; color: string }[] = [
  { value: "blue", color: "#3b82f6" },
  { value: "green", color: "#10b981" },
  { value: "purple", color: "#8b5cf6" },
  { value: "orange", color: "#f59e0b" },
  { value: "red", color: "#ef4444" },
];

export default function AppearanceSection({ settings, update }: Props) {
  const { t } = useTranslation();

  const themeOptions: {
    value: AppSettings["theme"];
    label: string;
    description: string;
  }[] = [
    { value: "light", label: t("appearanceSettings.light"), description: t("appearanceSettings.lightDescription") },
    { value: "dark", label: t("appearanceSettings.dark"), description: t("appearanceSettings.darkDescription") },
    { value: "transparent", label: t("appearanceSettings.transparent"), description: t("appearanceSettings.transparentDescription") },
  ];

  return (
    <div>
      <SectionTitle>{t("appearanceSettings.title")}</SectionTitle>
      <SectionDescription>
        {t("appearanceSettings.description")}
      </SectionDescription>

      <FieldGroup label={t("appearanceSettings.theme")} description={t("appearanceSettings.themeDescription")}>
        <div className="flex gap-2 mt-1">
          {themeOptions.map((opt) => {
            const active = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("theme", opt.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
                  ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                <div
                  className={`h-8 w-full rounded-md border ${
                    opt.value === "light"
                      ? "bg-white border-gray-200"
                      : opt.value === "dark"
                        ? "bg-gray-900 border-gray-700"
                        : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={
                    opt.value === "transparent"
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(200,200,255,0.2) 100%)",
                          backdropFilter: "blur(4px)",
                        }
                      : undefined
                  }
                />
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
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("appearanceSettings.roundedCorners")} description={t("appearanceSettings.roundedCornersDescription")} horizontal>
        <Toggle
          checked={settings.roundedPopupCorners}
          onChange={(v) => update("roundedPopupCorners", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("appearanceSettings.compactPopup")} description={t("appearanceSettings.compactPopupDescription")} horizontal>
        <Toggle
          checked={settings.useCompactPopup}
          onChange={(v) => update("useCompactPopup", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("appearanceSettings.reduceEffects")} description={t("appearanceSettings.reduceEffectsDescription")} horizontal>
        <Toggle
          checked={settings.reduceVisualEffects}
          onChange={(v) => update("reduceVisualEffects", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("appearanceSettings.accentColor")} description={t("appearanceSettings.accentColorDescription")}>
        <div className="flex gap-2 mt-1">
          {accentOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("accentStyle", opt.value)}
              title={opt.value}
              className={`h-7 w-7 rounded-full transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400
                ${
                  settings.accentStyle === opt.value
                    ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900 scale-110"
                    : "hover:scale-105"
                }`}
              style={{ backgroundColor: opt.color }}
            />
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
