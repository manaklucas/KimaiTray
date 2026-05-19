import { useCallback, useEffect, useRef, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { logger } from "../utils/logger";

interface UpdaterState {
  available: boolean;
  version: string | null;
  body: string | null;
  downloading: boolean;
  checking: boolean;
  error: string | null;
  upToDate: boolean;
  install: (() => Promise<void>) | null;
  checkNow: () => void;
}

export function useUpdater(autoUpdate = true): UpdaterState {
  const [state, setState] = useState<Omit<UpdaterState, "checkNow">>({
    available: false,
    version: null,
    body: null,
    downloading: false,
    checking: false,
    error: null,
    upToDate: false,
    install: null,
  });

  const autoUpdateRef = useRef(autoUpdate);
  autoUpdateRef.current = autoUpdate;

  const doCheck = useCallback(async () => {
    setState((s) => ({ ...s, checking: true, error: null, upToDate: false }));

    async function installUpdate(update: Update) {
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
    }

    try {
      const update: Update | null = await check();

      if (update) {
        logger.info(`Update available: ${update.version}`);
        setState({
          available: true,
          version: update.version,
          body: update.body ?? null,
          downloading: autoUpdateRef.current,
          checking: false,
          error: null,
          upToDate: false,
          install: () => installUpdate(update),
        });

        if (autoUpdateRef.current) {
          installUpdate(update);
        }
      } else {
        logger.debug("App is up to date");
        setState((s) => ({ ...s, checking: false, upToDate: true }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.debug(`Update check skipped: ${msg}`);
      setState((s) => ({ ...s, checking: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    doCheck();
  }, [doCheck]);

  return { ...state, checkNow: doCheck };
}
