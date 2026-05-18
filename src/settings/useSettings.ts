import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings, SavedConnection } from "../types";
import { defaultSettings, loadSettings, saveSettings } from "./service";
import {
  deleteApiToken,
  getApiToken,
  saveApiToken,
} from "../api/secureStore";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  const prevUrlRef = useRef("");
  const urlRef = useRef("");
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      prevUrlRef.current = s.kimaiUrl;
      urlRef.current = s.kimaiUrl;
      loadToken(s.kimaiUrl);
    });
  }, []);

  async function loadToken(url: string) {
    try {
      const t = await getApiToken(url);
      setToken(t ?? "");
    } catch {
      setToken("");
    } finally {
      setLoaded(true);
    }
  }

  const update = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings(next);

        if (key === "kimaiUrl") {
          const newUrl = value as string;
          urlRef.current = newUrl;
          if (newUrl !== prevUrlRef.current) {
            prevUrlRef.current = newUrl;
            loadToken(newUrl);
          }
        }

        return next;
      });
    },
    [],
  );

  const updateToken = useCallback(
    async (value: string) => {
      setToken(value);
      const url = urlRef.current;
      if (url) {
        try {
          if (value) {
            await saveApiToken(url, value);
          } else {
            await deleteApiToken(url);
          }
        } catch {
          // Store unavailable
        }
      }
    },
    [],
  );

  const saveConnection = useCallback(
    async (conn: SavedConnection, newToken: string) => {
      const prev = settingsRef.current;
      const oldConn = prev.connections.find((c) => c.id === conn.id);
      const oldUrl = oldConn?.url;

      const idx = prev.connections.findIndex((c) => c.id === conn.id);
      const connections = [...prev.connections];
      if (idx >= 0) {
        connections[idx] = conn;
      } else {
        connections.push(conn);
      }

      const next = {
        ...prev,
        connections,
        activeConnectionId: conn.id,
        kimaiUrl: conn.url,
      };
      setSettings(next);
      saveSettings(next);

      if (oldUrl && oldUrl !== conn.url) {
        const urlStillUsed = connections.some(
          (c) => c.id !== conn.id && c.url === oldUrl,
        );
        if (!urlStillUsed) {
          await deleteApiToken(oldUrl);
        }
      }
      if (conn.url && newToken) {
        await saveApiToken(conn.url, newToken);
      }
      setToken(newToken);
      prevUrlRef.current = conn.url;
      urlRef.current = conn.url;
    },
    [],
  );

  const removeConnection = useCallback(async (id: string) => {
    const prev = settingsRef.current;
    const conn = prev.connections.find((c) => c.id === id);
    const wasActive = prev.activeConnectionId === id;
    const remaining = prev.connections.filter((c) => c.id !== id);
    const newActive = wasActive ? remaining[0] : null;

    const next = {
      ...prev,
      connections: remaining,
      activeConnectionId: wasActive
        ? (newActive?.id ?? "")
        : prev.activeConnectionId,
      kimaiUrl: wasActive ? (newActive?.url ?? "") : prev.kimaiUrl,
    };
    setSettings(next);
    saveSettings(next);

    if (conn?.url) {
      const urlStillUsed = remaining.some((c) => c.url === conn.url);
      if (!urlStillUsed) {
        await deleteApiToken(conn.url);
      }
    }

    if (wasActive) {
      if (newActive) {
        prevUrlRef.current = newActive.url;
        urlRef.current = newActive.url;
        await loadToken(newActive.url);
      } else {
        setToken("");
        prevUrlRef.current = "";
        urlRef.current = "";
      }
    }
  }, []);

  const activateConnection = useCallback(async (id: string) => {
    const prev = settingsRef.current;
    const conn = prev.connections.find((c) => c.id === id);
    if (!conn || prev.activeConnectionId === id) return;

    const next = { ...prev, activeConnectionId: id, kimaiUrl: conn.url };
    setSettings(next);
    saveSettings(next);

    prevUrlRef.current = conn.url;
    urlRef.current = conn.url;
    await loadToken(conn.url);
  }, []);

  return {
    settings,
    token,
    update,
    updateToken,
    loaded,
    saveConnection,
    removeConnection,
    activateConnection,
  };
}
