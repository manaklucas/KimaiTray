import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import {
  Divider,
  FieldGroup,
  NumberInput,
  SectionDescription,
  SectionTitle,
  Select,
  Toggle,
} from "./Controls";

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function IdleDetectionSection({ settings, update }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <SectionTitle>{t("idle.title")}</SectionTitle>
      <SectionDescription>
        {t("idle.description")}
      </SectionDescription>

      <FieldGroup label={t("idle.enableIdle")} description={t("idle.enableIdleDescription")} horizontal>
        <Toggle
          checked={settings.enableIdleDetection}
          onChange={(v) => update("enableIdleDetection", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("idle.idleThreshold")} description={t("idle.idleThresholdDescription")} horizontal>
        <NumberInput
          value={settings.idleThresholdMinutes}
          onChange={(v) => update("idleThresholdMinutes", v)}
          min={1}
          max={60}
          suffix="min"
          disabled={!settings.enableIdleDetection}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("idle.whenIdle")} description={t("idle.whenIdleDescription")} horizontal>
        <Select
          value={settings.idleAction}
          onChange={(v) =>
            update("idleAction", v as AppSettings["idleAction"])
          }
          options={[
            { value: "ask", label: t("idle.askMe") },
            { value: "stop", label: t("idle.stopTimer") },
            { value: "discard", label: t("idle.discardIdleTime") },
            { value: "continue", label: t("idle.keepRunning") },
          ]}
          disabled={!settings.enableIdleDetection}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label={t("idle.showNotification")} description={t("idle.showNotificationDescription")} horizontal>
        <Toggle
          checked={settings.showIdleNotification}
          onChange={(v) => update("showIdleNotification", v)}
          disabled={!settings.enableIdleDetection}
        />
      </FieldGroup>
    </div>
  );
}
