import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  SectionTitle,
  ShortcutInput,
} from "./Controls";

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const SHORTCUT_KEYS = [
  { key: "shortcutTogglePopup" as const, labelKey: "shortcuts.togglePopup", descKey: "shortcuts.togglePopupDescription" },
  { key: "shortcutStartStopTimer" as const, labelKey: "shortcuts.startStopTimer", descKey: "shortcuts.startStopTimerDescription" },
  { key: "shortcutOpenSettings" as const, labelKey: "shortcuts.openSettings", descKey: "shortcuts.openSettingsDescription" },
];

function findConflict(
  currentKey: string,
  value: string,
  settings: AppSettings,
  t: (key: string, opts?: Record<string, string>) => string,
): string | null {
  if (!value) return null;
  for (const s of SHORTCUT_KEYS) {
    if (s.key !== currentKey && settings[s.key] === value) {
      return t("shortcuts.conflict", { action: t(s.labelKey) });
    }
  }
  return null;
}

export default function ShortcutsSection({ settings, update }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <SectionTitle>{t("shortcuts.title")}</SectionTitle>
      <SectionDescription>{t("shortcuts.description")}</SectionDescription>

      {SHORTCUT_KEYS.map((item, i) => {
        const conflict = findConflict(item.key, settings[item.key], settings, t);
        return (
          <div key={item.key}>
            {i > 0 && <Divider />}
            <FieldGroup label={t(item.labelKey)} description={t(item.descKey)} horizontal>
              <ShortcutInput
                value={settings[item.key]}
                onChange={(v) => update(item.key, v)}
              />
            </FieldGroup>
            {conflict && (
              <div className="mt-1 text-[11px] text-red-500 dark:text-red-400">
                {conflict}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
