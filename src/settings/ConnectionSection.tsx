import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings, SavedConnection } from "../types";
import { testConnection, isInsecureUrl, type ConnectionResult } from "../api";
import { getApiToken } from "../api/secureStore";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  SectionTitle,
  TextInput,
} from "./Controls";

interface Props {
  settings: AppSettings;
  token: string;
  saveConnection: (conn: SavedConnection, token: string) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  activateConnection: (id: string) => Promise<void>;
}

export default function ConnectionSection({
  settings,
  token,
  saveConnection,
  removeConnection,
  activateConnection,
}: Props) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(
    settings.activeConnectionId || null,
  );
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editToken, setEditToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "testing" | "connected" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const initialized = useRef(false);

  const loadFormForConnection = useCallback(
    async (id: string | null) => {
      setEditingId(id);
      setStatus("idle");
      setStatusMessage("");
      setShowToken(false);

      if (id) {
        const conn = settings.connections.find((c) => c.id === id);
        if (conn) {
          setName(conn.name);
          setUrl(conn.url);
          try {
            const t = await getApiToken(conn.url);
            setEditToken(t ?? "");
          } catch {
            setEditToken("");
          }
        }
      } else {
        setName("");
        setUrl("");
        setEditToken("");
      }
    },
    [settings.connections],
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (settings.activeConnectionId) {
        loadFormForConnection(settings.activeConnectionId);
      } else if (settings.kimaiUrl) {
        setUrl(settings.kimaiUrl);
      }
    }
  }, [settings.activeConnectionId, settings.kimaiUrl, loadFormForConnection]);

  useEffect(() => {
    if (
      editingId === settings.activeConnectionId &&
      token &&
      !editToken
    ) {
      setEditToken(token);
    }
  }, [token, editingId, settings.activeConnectionId, editToken]);

  const insecure = url.length > 0 && isInsecureUrl(url);

  const handleSelectConnection = useCallback(
    async (id: string) => {
      await activateConnection(id);
      loadFormForConnection(id);
    },
    [activateConnection, loadFormForConnection],
  );

  const handleAddNew = useCallback(() => {
    loadFormForConnection(null);
  }, [loadFormForConnection]);

  const handleTestAndSave = useCallback(async () => {
    setStatus("testing");
    setStatusMessage("");

    let result: ConnectionResult;
    try {
      result = await testConnection(url, editToken);
    } catch {
      setStatus("error");
      setStatusMessage(t("connection.unexpectedError"));
      return;
    }

    if (result.success && result.user) {
      let connName = name;
      if (!connName) {
        try {
          connName = new URL(url).hostname;
        } catch {
          connName = url;
        }
      }
      const id = editingId || crypto.randomUUID();

      await saveConnection({ id, name: connName, url }, editToken);
      setEditingId(id);
      if (!name) setName(connName);

      setStatus("connected");
      const who = result.user.alias || result.user.username;
      const ver = result.version ? ` · Kimai ${result.version.version}` : "";
      setStatusMessage(`${t("connection.connectedAs", { user: who })}${ver}`);
    } else {
      setStatus("error");
      setStatusMessage(result.error ?? t("connection.connectionFailed"));
    }
  }, [url, editToken, name, editingId, saveConnection, t]);

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await removeConnection(id);
      if (editingId === id) {
        const remaining = settings.connections.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          loadFormForConnection(remaining[0].id);
        } else {
          loadFormForConnection(null);
        }
      }
    },
    [editingId, settings.connections, removeConnection, loadFormForConnection],
  );

  return (
    <div>
      <SectionTitle>{t("connection.title")}</SectionTitle>
      <SectionDescription>
        {t("connection.description")}
      </SectionDescription>

      {/* Saved connections list */}
      {settings.connections.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          {settings.connections.map((conn) => (
            <div
              key={conn.id}
              onClick={() => handleSelectConnection(conn.id)}
              className={`flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-[12px] last:border-b-0 dark:border-gray-800
                ${
                  editingId === conn.id
                    ? "bg-[var(--accent-light)]"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  conn.id === settings.activeConnectionId
                    ? "bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                {conn.name}
              </span>
              <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                {conn.url}
              </span>
              <button
                type="button"
                onClick={(e) => handleDelete(conn.id, e)}
                className="ml-auto shrink-0 p-0.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddNew}
            className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-[var(--accent)] hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {t("connection.addNew")}
          </button>
        </div>
      )}

      {insecure && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400">
          <svg
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <span>
            {t("connection.httpsWarning")}
          </span>
        </div>
      )}

      <FieldGroup
        label={t("connection.connectionName")}
        description={t("connection.connectionNameDescription")}
      >
        <TextInput
          value={name}
          onChange={setName}
          placeholder={t("connection.connectionNamePlaceholder")}
        />
      </FieldGroup>

      <FieldGroup
        label={t("connection.baseUrl")}
        description={t("connection.baseUrlDescription")}
      >
        <TextInput
          type="url"
          value={url}
          onChange={setUrl}
          placeholder={t("connection.baseUrlPlaceholder")}
        />
      </FieldGroup>

      <FieldGroup
        label={t("connection.apiToken")}
        description={t("connection.apiTokenDescription")}
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              type={showToken ? "text" : "password"}
              value={editToken}
              onChange={setEditToken}
              placeholder={t("connection.apiTokenPlaceholder")}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-500
              hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
              focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
          >
            {showToken ? t("common.hide") : t("common.show")}
          </button>
        </div>
      </FieldGroup>

      <Divider />

      {/* Test & Save + status */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleTestAndSave}
          disabled={status === "testing" || !url || !editToken}
          className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-[12px] font-medium text-white
            hover:bg-[var(--accent-hover)] active:opacity-80
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
            transition-colors"
        >
          {status === "testing" ? t("connection.testing") : t("connection.testAndSave")}
        </button>

        <StatusBadge status={status} message={statusMessage} />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  message,
}: {
  status: "idle" | "testing" | "connected" | "error";
  message: string;
}) {
  if (status === "idle" || status === "testing") return null;

  const isOk = status === "connected";
  return (
    <span
      className={`flex items-center gap-1.5 text-[12px] ${
        isOk
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-500 dark:text-red-400"
      }`}
    >
      {isOk ? (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {message}
    </span>
  );
}
