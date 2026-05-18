export interface ActiveTimer {
  id: number;
  projectId: number;
  activityId: number;
  project: string;
  projectColor: string;
  activity: string;
  description: string;
  beginSeconds: number;
  beginIso: string;
}

export interface RecentTask {
  key: string;
  projectId: number;
  activityId: number;
  project: string;
  projectColor: string;
  customer: string;
  activity: string;
  description: string;
  lastUsed: string;
}

export interface SavedConnection {
  id: string;
  name: string;
  url: string;
}

export interface AppSettings {
  kimaiUrl: string;
  connections: SavedConnection[];
  activeConnectionId: string;

  language: "sk" | "en" | "cs" | "de" | "uk" | "system";

  launchAtLogin: boolean;
  refreshInterval: number;
  openKimaiInBrowser: boolean;

  showElapsedInTray: boolean;
  showTaskNameInTray: boolean;
  menuBarLabelStyle: "timer" | "project" | "activity" | "hidden";
  showSecondsInTimer: boolean;

  enableIdleDetection: boolean;
  idleThresholdMinutes: number;
  idleAction: "ask" | "stop" | "discard" | "continue";
  showIdleNotification: boolean;

  theme: "light" | "dark" | "transparent";
  useCompactPopup: boolean;
  roundedPopupCorners: boolean;
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
