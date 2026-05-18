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

export type TrayIconState = "idle" | "running" | "error";

export async function setTrayIcon(state: TrayIconState): Promise<void> {
  try {
    await invoke("set_tray_icon", { state });
  } catch {
    // best-effort
  }
}
