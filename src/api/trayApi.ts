import { invoke } from "@tauri-apps/api/core";

export async function setTrayTooltip(text: string): Promise<void> {
  try {
    await invoke("set_tray_tooltip", { text });
  } catch {
    // best-effort
  }
}

export async function setTrayTitle(title: string): Promise<void> {
  try {
    await invoke("set_tray_title", { title });
  } catch {
    // best-effort — title only visible on macOS menu bar
  }
}

export type TrayIconState = "idle" | "running" | "paused" | "error";

export async function setTrayIcon(state: TrayIconState): Promise<void> {
  try {
    await invoke("set_tray_icon", { state });
  } catch {
    // best-effort
  }
}

export async function setPopupVibrancy(enabled: boolean): Promise<void> {
  try {
    await invoke("set_popup_vibrancy", { enabled });
  } catch {
    // best-effort — only works on macOS
  }
}

export async function setPopupSize(width: number, height: number, zoom: number): Promise<void> {
  try {
    await invoke("set_popup_size", { width, height, zoom });
  } catch {
    // best-effort
  }
}

export async function setPopupCornerRadius(radius: number): Promise<void> {
  try {
    await invoke("set_popup_corner_radius", { radius });
  } catch {
    // best-effort — only works on macOS
  }
}

export async function registerShortcuts(shortcuts: {
  togglePopup: string;
  startStopTimer: string;
  openSettings: string;
}): Promise<void> {
  await invoke("register_shortcuts", shortcuts);
}

export async function setTrayClickActions(leftAction: string, rightAction: string): Promise<void> {
  try {
    await invoke("set_tray_click_actions", { leftAction, rightAction });
  } catch {
    // best-effort
  }
}

export async function updateTrayMenu(labels: {
  toggleLabel: string;
  settingsLabel: string;
  openKimaiLabel: string;
  refreshLabel: string;
  quitLabel: string;
}): Promise<void> {
  try {
    await invoke("update_tray_menu", labels);
  } catch {
    // best-effort
  }
}
