import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createKimaiClient, type KimaiClient } from "../api/kimaiClient";
import { getApiToken } from "../api/secureStore";
import { loadSettings } from "../settings/service";

interface IdleSettings {
  enableIdleDetection: boolean;
  idleThresholdMinutes: number;
  idleAction: "ask" | "stop" | "discard" | "continue";
  showIdleNotification: boolean;
}

interface TraySettings {
  showElapsedInTray: boolean;
  showTaskNameInTray: boolean;
  menuBarLabelStyle: "timer" | "project" | "activity" | "hidden";
}

interface UseKimaiClientResult {
  client: KimaiClient | null;
  isConfigured: boolean;
  refreshInterval: number;
  baseUrl: string;
  idleSettings: IdleSettings;
  traySettings: TraySettings;
}

const defaultIdleSettings: IdleSettings = {
  enableIdleDetection: false,
  idleThresholdMinutes: 5,
  idleAction: "ask",
  showIdleNotification: true,
};

const defaultTraySettings: TraySettings = {
  showElapsedInTray: true,
  showTaskNameInTray: false,
  menuBarLabelStyle: "timer",
};

export function useKimaiClient(): UseKimaiClientResult {
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [ready, setReady] = useState(false);
  const [idleSettings, setIdleSettings] =
    useState<IdleSettings>(defaultIdleSettings);
  const [traySettings, setTraySettings] =
    useState<TraySettings>(defaultTraySettings);

  const load = useCallback(async () => {
    const s = await loadSettings();
    setBaseUrl(s.kimaiUrl);
    setRefreshInterval(s.refreshInterval);
    setIdleSettings({
      enableIdleDetection: s.enableIdleDetection,
      idleThresholdMinutes: s.idleThresholdMinutes,
      idleAction: s.idleAction,
      showIdleNotification: s.showIdleNotification,
    });
    setTraySettings({
      showElapsedInTray: s.showElapsedInTray,
      showTaskNameInTray: s.showTaskNameInTray,
      menuBarLabelStyle: s.menuBarLabelStyle,
    });
    if (s.kimaiUrl) {
      try {
        const t = await getApiToken(s.kimaiUrl);
        setToken(t ?? "");
      } catch {
        setToken("");
      }
    } else {
      setToken("");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const win = getCurrentWindow();
    const unlistenFocus = win.onFocusChanged(({ payload }) => {
      if (payload) load();
    });
    const unlistenShow = win.listen("tauri://window-show", () => {
      load();
    });
    return () => {
      unlistenFocus.then((fn) => fn());
      unlistenShow.then((fn) => fn());
    };
  }, [load]);

  const client = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createKimaiClient(baseUrl, token);
  }, [baseUrl, token]);

  return {
    client,
    isConfigured: ready && !!baseUrl && !!token,
    refreshInterval,
    baseUrl,
    idleSettings,
    traySettings,
  };
}
