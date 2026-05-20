import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { AppSettings } from "../types";
import i18n from "../shared/i18n";
import { resolveLanguage, type LanguageSetting } from "../shared/i18n";
import { setTrayClickActions } from "../api/trayApi";
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
    </div>
  );
}
