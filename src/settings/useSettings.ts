import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "../types";
import {
  defaultSettings,
  getApiToken,
  loadSettings,
  saveSettings,
  setApiToken,
} from "./service";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadSettings(), getApiToken()]).then(([s, t]) => {
      setSettings(s);
      setToken(t);
      setLoaded(true);
    });
  }, []);

  const update = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings(next);
        return next;
      });
    },
    [],
  );

  const updateToken = useCallback((value: string) => {
    setToken(value);
    setApiToken(value);
  }, []);

  return { settings, token, update, updateToken, loaded };
}
