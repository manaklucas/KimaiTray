import { useCallback, useEffect, useState } from "react";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { AppSettings } from "../types";
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

export default function GeneralSection({ settings, update }: Props) {
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

  return (
    <div>
      <SectionTitle>General</SectionTitle>
      <SectionDescription>
        Configure startup behavior and data refresh.
      </SectionDescription>

      <FieldGroup label="Launch at login" description="Start KimaiMate automatically when you log in" horizontal>
        <Toggle
          checked={autostart}
          onChange={toggleAutostart}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Refresh interval" description="How often to sync data from Kimai" horizontal>
        <Select
          value={settings.refreshInterval}
          onChange={(v) => update("refreshInterval", Number(v))}
          options={[
            { value: 15, label: "15 seconds" },
            { value: 30, label: "30 seconds" },
            { value: 60, label: "1 minute" },
            { value: 120, label: "2 minutes" },
            { value: 300, label: "5 minutes" },
            { value: 600, label: "10 minutes" },
          ]}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Open Kimai in browser" description="Open your Kimai instance in the default browser" horizontal>
        <Toggle
          checked={settings.openKimaiInBrowser}
          onChange={(v) => update("openKimaiInBrowser", v)}
        />
      </FieldGroup>
    </div>
  );
}
