import { useTranslation } from "react-i18next";
import { check } from "@tauri-apps/plugin-updater";
import { useCallback, useState } from "react";
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

export default function UpdateSection({ settings, update }: Props) {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<"upToDate" | "available" | "error" | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  const checkNow = useCallback(async () => {
    setChecking(true);
    setResult(null);
    try {
      const upd = await check();
      if (upd) {
        setResult("available");
        setVersion(upd.version);
        await upd.downloadAndInstall();
        const { relaunch } = await import("@tauri-apps/plugin-process");
        await relaunch();
      } else {
        setResult("upToDate");
      }
    } catch {
      setResult("error");
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <div>
      <SectionTitle>{t("updateSettings.title")}</SectionTitle>
      <SectionDescription>{t("updateSettings.description")}</SectionDescription>

      <FieldGroup
        label={t("updateSettings.autoUpdate")}
        description={t("updateSettings.autoUpdateDescription")}
        horizontal
      >
        <Toggle
          checked={settings.autoUpdate}
          onChange={(v) => update("autoUpdate", v)}
        />
      </FieldGroup>

      <Divider />

      <div className="py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={checking}
            onClick={checkNow}
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] font-medium
              text-gray-700 transition-colors
              hover:bg-gray-100 active:bg-gray-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
              dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? t("updateSettings.checking") : t("updateSettings.checkForUpdates")}
          </button>
          {result === "upToDate" && (
            <span className="text-[11px] text-green-600 dark:text-green-400">
              {t("updateSettings.upToDate")}
            </span>
          )}
          {result === "available" && (
            <span className="text-[11px] text-blue-600 dark:text-blue-400">
              {t("updateSettings.updateAvailable", { version })}
            </span>
          )}
          {result === "error" && (
            <span className="text-[11px] text-red-500 dark:text-red-400">
              {t("updateSettings.checkFailed")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
