import type { AppSettings } from "../types";

const SETTINGS_KEY = "kimaimate_settings";
const TOKEN_KEY = "kimaimate_api_token";

export const defaultSettings: AppSettings = {
  kimaiUrl: "",

  launchAtLogin: false,
  refreshInterval: 60,
  openKimaiInBrowser: true,

  showElapsedInTray: true,
  showTaskNameInTray: false,
  menuBarLabelStyle: "timer",

  enableIdleDetection: false,
  idleThresholdMinutes: 5,
  idleAction: "ask",
  showIdleNotification: true,

  useCompactPopup: false,
  reduceVisualEffects: false,
  accentStyle: "blue",
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Token stored separately — will migrate to OS keychain via Tauri plugin
export async function getApiToken(): Promise<string> {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export async function setApiToken(token: string): Promise<void> {
  localStorage.setItem(TOKEN_KEY, token);
}
