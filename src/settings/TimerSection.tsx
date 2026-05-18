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

export default function TimerSection({ settings, update }: Props) {
  return (
    <div>
      <SectionTitle>Timer</SectionTitle>
      <SectionDescription>
        Control how running timers appear in the menu bar and tray.
      </SectionDescription>

      <FieldGroup label="Show elapsed time in tray" description="Display the running duration next to the tray icon" horizontal>
        <Toggle
          checked={settings.showElapsedInTray}
          onChange={(v) => update("showElapsedInTray", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Show task name in tray" description="Display the current project or activity name" horizontal>
        <Toggle
          checked={settings.showTaskNameInTray}
          onChange={(v) => update("showTaskNameInTray", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Menu bar label style" description="What to display as the tray label text" horizontal>
        <Select
          value={settings.menuBarLabelStyle}
          onChange={(v) =>
            update(
              "menuBarLabelStyle",
              v as AppSettings["menuBarLabelStyle"],
            )
          }
          options={[
            { value: "timer", label: "Timer" },
            { value: "project", label: "Project name" },
            { value: "activity", label: "Activity name" },
            { value: "hidden", label: "Icon only" },
          ]}
        />
      </FieldGroup>
    </div>
  );
}
