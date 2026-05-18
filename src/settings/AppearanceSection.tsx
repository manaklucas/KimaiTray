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
  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>
      <SectionDescription>
        Customize the look and feel of KimaiMate.
      </SectionDescription>

      <FieldGroup label="Compact popup" description="Use a smaller, denser layout for the tray popup" horizontal>
        <Toggle
          checked={settings.useCompactPopup}
          onChange={(v) => update("useCompactPopup", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Reduce visual effects" description="Disable animations and translucency" horizontal>
        <Toggle
          checked={settings.reduceVisualEffects}
          onChange={(v) => update("reduceVisualEffects", v)}
        />
      </FieldGroup>

      <Divider />

      <FieldGroup label="Accent color" description="Used for active states and primary actions">
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
