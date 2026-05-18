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
  return (
    <div>
      <SectionTitle>Idle Detection</SectionTitle>
      <SectionDescription>
        Detect when you step away and decide what happens to the running timer.
      </SectionDescription>

      <FieldGroup label="Enable idle detection" description="Monitor system activity to detect inactivity" horizontal>
        <Toggle
          checked={settings.enableIdleDetection}
          onChange={(v) => update("enableIdleDetection", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Idle threshold" description="Minutes of inactivity before considered idle" horizontal>
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

      <FieldGroup label="When idle is detected" description="What to do with the running timer" horizontal>
        <Select
          value={settings.idleAction}
          onChange={(v) =>
            update("idleAction", v as AppSettings["idleAction"])
          }
          options={[
            { value: "ask", label: "Ask me" },
            { value: "stop", label: "Stop timer" },
            { value: "discard", label: "Discard idle time" },
            { value: "continue", label: "Keep running" },
          ]}
          disabled={!settings.enableIdleDetection}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Show idle notification" description="Display a system notification when idle is detected" horizontal>
        <Toggle
          checked={settings.showIdleNotification}
          onChange={(v) => update("showIdleNotification", v)}
          disabled={!settings.enableIdleDetection}
        />
      </FieldGroup>
    </div>
  );
}
