export interface ActiveTimer {
  id: number;
  project: string;
  projectColor: string;
  activity: string;
  description: string;
  beginSeconds: number;
}

export interface RecentTask {
  id: number;
  project: string;
  projectColor: string;
  activity: string;
  description: string;
  lastUsed: string;
}

export interface AppSettings {
  kimaiUrl: string;

  launchAtLogin: boolean;
  refreshInterval: number;
  openKimaiInBrowser: boolean;

  showElapsedInTray: boolean;
  showTaskNameInTray: boolean;
  menuBarLabelStyle: "timer" | "project" | "activity" | "hidden";

  enableIdleDetection: boolean;
  idleThresholdMinutes: number;
  idleAction: "ask" | "stop" | "discard" | "continue";
  showIdleNotification: boolean;

  useCompactPopup: boolean;
  reduceVisualEffects: boolean;
  accentStyle: "blue" | "green" | "purple" | "orange" | "red";
}

export type SettingsSection =
  | "connection"
  | "general"
  | "timer"
  | "idle"
  | "appearance"
  | "about";
