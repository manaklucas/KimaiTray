import { useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { logger } from "../utils/logger";

interface UpdaterState {
  available: boolean;
  version: string | null;
  body: string | null;
  downloading: boolean;
  error: string | null;
  install: (() => Promise<void>) | null;
}

export function useUpdater(): UpdaterState {
  const [state, setState] = useState<UpdaterState>({
    available: false,
    version: null,
    body: null,
    downloading: false,
    error: null,
    install: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkForUpdate() {
      try {
        const update: Update | null = await check();
        if (cancelled) return;

        if (update) {
          logger.info(`Update available: ${update.version}`);
          setState({
            available: true,
            version: update.version,
            body: update.body ?? null,
            downloading: false,
            error: null,
            install: async () => {
              setState((s) => ({ ...s, downloading: true, error: null }));
              try {
                await update.downloadAndInstall();
                const { relaunch } = await import("@tauri-apps/plugin-process");
                await relaunch();
              } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                logger.error(`Update install failed: ${msg}`);
                setState((s) => ({ ...s, downloading: false, error: msg }));
              }
            },
          });
        } else {
          logger.debug("App is up to date");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.debug(`Update check skipped: ${msg}`);
      }
    }

    checkForUpdate();
    return () => { cancelled = true; };
  }, []);

  return state;
}
