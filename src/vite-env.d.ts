/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENV: "development" | "staging" | "production";
  readonly VITE_LOG_LEVEL: "debug" | "info" | "warn" | "error";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
