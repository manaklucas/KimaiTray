import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings } from "../types";
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

  return { settings, token, update, updateToken, loaded };
}
