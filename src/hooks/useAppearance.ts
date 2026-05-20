import { useEffect } from "react";
import { loadSettings, onSettingsChange } from "../settings/service";
import { setPopupCornerRadius, setPopupSize, setPopupVibrancy, setDisplayMode } from "../api/trayApi";
import type { AppSettings } from "../types";

const POPUP_BASE_WIDTH = 360;
const POPUP_BASE_HEIGHT = 640;

const UI_SIZE_SCALE: Record<AppSettings["uiSize"], number> = {
  small: 0.85,
  default: 1,
  large: 1.15,
};

let mediaCleanup: (() => void) | null = null;

function applyThemeClass(theme: AppSettings["theme"]) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }
}

function apply(s: AppSettings) {
  document.documentElement.dataset.accent = s.accentStyle;
  document.documentElement.dataset.reduceMotion = String(s.reduceVisualEffects);
  document.documentElement.dataset.uiSize = s.uiSize;
  document.documentElement.dataset.roundedPopup = String(s.roundedPopupCorners);
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.layout = s.popupLayout;

  applyThemeClass(s.theme);

  if (mediaCleanup) {
    mediaCleanup();
    mediaCleanup = null;
  }

  if (s.theme === "transparent") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    mediaCleanup = () => mq.removeEventListener("change", handler);
  }

  document.documentElement.dataset.displayMode = s.displayMode ?? "tray";

  const isDetached = s.displayMode === "detached";

  if (!isDetached) {
    const scale = UI_SIZE_SCALE[s.uiSize];
    setPopupSize(
      Math.round(POPUP_BASE_WIDTH * scale),
      Math.round(POPUP_BASE_HEIGHT * scale),
      scale,
    );
  }
  setPopupCornerRadius(s.roundedPopupCorners && !isDetached ? 10.0 : 0.0);

  if (document.documentElement.dataset.window === "tray-popup") {
    setPopupVibrancy(s.theme === "transparent");
    setDisplayMode(s.displayMode ?? "tray");
  }
}

export function useAppearance() {
  useEffect(() => {
    loadSettings().then(apply);
    const cleanup = onSettingsChange(apply);
    return () => {
      cleanup.then((fn) => fn());
      if (mediaCleanup) {
        mediaCleanup();
        mediaCleanup = null;
      }
    };
  }, []);
}
