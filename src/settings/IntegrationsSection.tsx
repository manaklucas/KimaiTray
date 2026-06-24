import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import type { IssueIntegrationSettings, ExternalLabel, ExternalRepo } from "../integrations/issues/types";
import { createIssueProvider } from "../integrations/issues/issueProvider";
import SearchableSelect from "../components/SearchableSelect";
import {
  getIssueToken,
  saveIssueToken,
} from "../integrations/issues/issueTokenStore";
import {
  Divider,
  FieldGroup,
  SectionDescription,
  Select,
  TextInput,
  Toggle,
} from "./Controls";

const PROVIDER_API_VERSION: Record<IssueIntegrationSettings["provider"], string> = {
  gitlab: "v4",
  github: "REST v3 (2022-11-28)",
  gitea: "v1",
};

const emptyConfig: IssueIntegrationSettings = {
  enabled: false,
  provider: "gitlab",
  baseUrl: "",
  apiBaseUrl: "",
  projectPathOrRepo: "",
  defaultState: "opened",
  assigneeOnly: false,
  syncTime: false,
  autoInsertUrl: false,
  filterLabels: [],
  filterLabelsMode: "include",
};

interface Props {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export default function IntegrationsSection({ settings, update }: Props) {
  const { t } = useTranslation();
  const [selectedConnectionId, setSelectedConnectionId] = useState(
    settings.activeConnectionId,
  );
  // Keep the selection valid if connections change (e.g. one is deleted),
  // falling back to the active connection or the first available one.
  const connectionId = settings.connections.some(
    (c) => c.id === selectedConnectionId,
  )
    ? selectedConnectionId
    : settings.activeConnectionId || settings.connections[0]?.id || "";
  const config = settings.issueIntegrations[connectionId] ?? emptyConfig;

  const [issueToken, setIssueToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");
  const [availableLabels, setAvailableLabels] = useState<ExternalLabel[]>([]);
  const [availableRepos, setAvailableRepos] = useState<ExternalRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [manualRepo, setManualRepo] = useState(false);

  useEffect(() => {
    if (!connectionId) {
      setIssueToken("");
      return;
    }
    getIssueToken(connectionId)
      .then((t) => setIssueToken(t ?? ""))
      .catch(() => setIssueToken(""));
    setTestStatus("idle");
    setTestMessage("");
    setShowToken(false);
    setAvailableLabels([]);
    setAvailableRepos([]);
    setReposLoading(false);
    setManualRepo(false);
  }, [connectionId]);

  const loadRepos = useCallback(async () => {
    if (!config.baseUrl || !issueToken) return;
    setReposLoading(true);
    try {
      const provider = createIssueProvider(config, issueToken);
      const repos = provider.fetchRepos ? await provider.fetchRepos() : [];
      setAvailableRepos(repos);
      setManualRepo(repos.length === 0);
    } catch {
      setAvailableRepos([]);
      setManualRepo(true);
    } finally {
      setReposLoading(false);
    }
  }, [config, issueToken]);

  const repoOptions = useMemo(() => {
    const opts = availableRepos.map((r) => ({ value: r.id, label: r.label }));
    if (
      config.projectPathOrRepo &&
      !opts.some((o) => o.value === config.projectPathOrRepo)
    ) {
      opts.unshift({
        value: config.projectPathOrRepo,
        label: config.projectPathOrRepo,
      });
    }
    return opts;
  }, [availableRepos, config.projectPathOrRepo]);

  const updateField = useCallback(
    <K extends keyof IssueIntegrationSettings>(
      key: K,
      value: IssueIntegrationSettings[K],
    ) => {
      if (!connectionId) return;
      const updated = { ...config, [key]: value };
      update("issueIntegrations", {
        ...settings.issueIntegrations,
        [connectionId]: updated,
      });
    },
    [config, connectionId, settings.issueIntegrations, update],
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      const provider = value as IssueIntegrationSettings["provider"];
      updateField("provider", provider);
      setTestStatus("idle");
      setTestMessage("");
    },
    [updateField],
  );

  const handleTokenChange = useCallback((value: string) => {
    setIssueToken(value);
    setTestStatus("idle");
    setTestMessage("");
  }, []);

  const handleTest = useCallback(async () => {
    if (!connectionId) return;
    setTestStatus("testing");
    setTestMessage("");
    setAvailableLabels([]);

    try {
      const provider = createIssueProvider(config, issueToken);
      const result = await provider.testConnection();
      if (result.success) {
        await saveIssueToken(connectionId, issueToken);
        setTestStatus("success");
        setTestMessage(
          t("integrations.connectionSuccess", { count: result.count ?? 0 }),
        );
        if (provider.fetchLabels) {
          provider.fetchLabels()
            .then(setAvailableLabels)
            .catch(() => {});
        }
        if (provider.fetchRepos) {
          provider.fetchRepos()
            .then((repos) => {
              setAvailableRepos(repos);
              if (repos.length > 0) setManualRepo(false);
            })
            .catch(() => {});
        }
      } else {
        setTestStatus("error");
        setTestMessage(result.error ?? t("integrations.connectionFailed"));
      }
    } catch {
      setTestStatus("error");
      setTestMessage(t("integrations.connectionFailed"));
    }
  }, [config, connectionId, issueToken, t]);

  const noConnection = !connectionId;
  const disabled = noConnection || !config.enabled;
  const canTest =
    !noConnection &&
    config.enabled &&
    config.baseUrl &&
    config.projectPathOrRepo &&
    issueToken &&
    testStatus !== "testing";

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
          {t("integrations.title")}
        </h2>
      </div>
      <SectionDescription>{t("integrations.description")}</SectionDescription>

      {noConnection ? (
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 text-[12px] text-gray-500 dark:text-gray-400">
          {t("status.notConfigured")}
        </div>
      ) : (
        <>

          <FieldGroup
            label={t("integrations.connection")}
            description={t("integrations.connectionDescription")}
          >
            <div className="flex flex-wrap gap-1.5">
              {settings.connections.map((c) => {
                const selected = c.id === connectionId;
                const isActive = c.id === settings.activeConnectionId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConnectionId(c.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors border
                      focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    {isActive && (
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                        title={t("integrations.activeSuffix")}
                      />
                    )}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          <Divider />

          <FieldGroup
            label={t("integrations.enabled")}
            description={t("integrations.enabledDescription")}
            horizontal
          >
            <Toggle
              checked={config.enabled}
              onChange={(v) => updateField("enabled", v)}
            />
          </FieldGroup>

          <Divider />

          <FieldGroup
            label={t("integrations.provider")}
            description={t("integrations.providerDescription")}
          >
            <Select
              value={config.provider}
              onChange={handleProviderChange}
              options={[
                { value: "gitlab", label: t("integrations.gitlab") },
                { value: "github", label: t("integrations.github") },
                { value: "gitea", label: t("integrations.gitea") },
              ]}
              disabled={disabled}
            />
            <div className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              {t("integrations.apiVersionHint", {
                version: PROVIDER_API_VERSION[config.provider],
              })}
            </div>
          </FieldGroup>

          <FieldGroup
            label={t("integrations.baseUrl")}
            description={t("integrations.baseUrlDescription")}
          >
            <TextInput
              type="url"
              value={config.baseUrl}
              onChange={(v) => updateField("baseUrl", v)}
              placeholder={
                config.provider === "github"
                  ? "https://github.com"
                  : config.provider === "gitea"
                    ? "https://gitea.com"
                    : t("integrations.baseUrlPlaceholder")
              }
              disabled={disabled}
            />
          </FieldGroup>

          {config.provider === "github" && (
            <FieldGroup
              label={t("integrations.apiBaseUrl")}
              description={t("integrations.apiBaseUrlDescription")}
            >
              <TextInput
                type="url"
                value={config.apiBaseUrl}
                onChange={(v) => updateField("apiBaseUrl", v)}
                placeholder={t("integrations.apiBaseUrlPlaceholder")}
                disabled={disabled}
              />
            </FieldGroup>
          )}

          <FieldGroup
            label={t("integrations.apiToken")}
            description={t("integrations.apiTokenDescription")}
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  type={showToken ? "text" : "password"}
                  value={issueToken}
                  onChange={handleTokenChange}
                  placeholder={t("integrations.apiTokenPlaceholder")}
                  disabled={disabled}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                disabled={disabled}
                className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-500
                  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
                  focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
                  disabled:opacity-50"
              >
                {showToken ? t("common.hide") : t("common.show")}
              </button>
            </div>
          </FieldGroup>

          <FieldGroup
            label={t("integrations.projectPathOrRepo")}
            description={t("integrations.projectPathOrRepoDescription")}
          >
            {!manualRepo && repoOptions.length > 0 ? (
              <SearchableSelect
                options={repoOptions}
                value={config.projectPathOrRepo || null}
                onChange={(v) => updateField("projectPathOrRepo", v ?? "")}
                placeholder={t("integrations.projectPathOrRepoSelectPlaceholder")}
                disabled={disabled}
              />
            ) : (
              <TextInput
                value={config.projectPathOrRepo}
                onChange={(v) => updateField("projectPathOrRepo", v)}
                placeholder={t("integrations.projectPathOrRepoPlaceholder")}
                disabled={disabled}
              />
            )}
            <div className="mt-1.5 flex items-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={loadRepos}
                disabled={disabled || !config.baseUrl || !issueToken || reposLoading}
                className="text-[var(--accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {reposLoading
                  ? t("integrations.repoLoading")
                  : t("integrations.repoLoad")}
              </button>
              {repoOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setManualRepo((m) => !m)}
                  disabled={disabled}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {manualRepo
                    ? t("integrations.repoPickFromList")
                    : t("integrations.repoEnterManually")}
                </button>
              )}
            </div>
          </FieldGroup>

          <FieldGroup
            label={t("integrations.defaultState")}
            description={t("integrations.defaultStateDescription")}
          >
            <Select
              value={config.defaultState}
              onChange={(v) =>
                updateField(
                  "defaultState",
                  v as IssueIntegrationSettings["defaultState"],
                )
              }
              options={[
                { value: "opened", label: t("integrations.stateOpened") },
                { value: "all", label: t("integrations.stateAll") },
              ]}
              disabled={disabled}
            />
          </FieldGroup>

          <FieldGroup
            label={t("integrations.assigneeOnly")}
            description={t("integrations.assigneeOnlyDescription")}
            horizontal
          >
            <Toggle
              checked={config.assigneeOnly ?? false}
              onChange={(v) => updateField("assigneeOnly", v)}
              disabled={disabled}
            />
          </FieldGroup>

          <FieldGroup
            label={t("integrations.filterLabels")}
            description={t(`integrations.filterLabelsDescription_${config.filterLabelsMode ?? "include"}`)}
          >
            {availableLabels.length > 0 ? (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => updateField("filterLabelsMode", "include")}
                    disabled={disabled}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      (config.filterLabelsMode ?? "include") === "include"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("integrations.filterModeInclude")}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("filterLabelsMode", "exclude")}
                    disabled={disabled}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      (config.filterLabelsMode ?? "include") === "exclude"
                        ? "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("integrations.filterModeExclude")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                  {availableLabels.map((label) => {
                    const selected = (config.filterLabels ?? []).includes(label.name);
                    const isExclude = (config.filterLabelsMode ?? "include") === "exclude";
                    return (
                      <button
                        key={label.name}
                        type="button"
                        onClick={() => {
                          const current = config.filterLabels ?? [];
                          const next = selected
                            ? current.filter((l) => l !== label.name)
                            : [...current, label.name];
                          updateField("filterLabels", next);
                        }}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
                          border focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${selected
                            ? isExclude
                              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through"
                              : "border-transparent text-white shadow-sm"
                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        style={selected && !isExclude ? { backgroundColor: label.color } : undefined}
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </button>
                    );
                  })}
                </div>
                {(config.filterLabels ?? []).length > 0 && (
                  <button
                    type="button"
                    onClick={() => updateField("filterLabels", [])}
                    disabled={disabled}
                    className="mt-1.5 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("integrations.clearLabels")}
                  </button>
                )}
              </>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5 text-[11px] text-gray-400 dark:text-gray-500 italic">
                {t("integrations.filterLabelsHint")}
              </div>
            )}
          </FieldGroup>

          {(config.provider === "gitlab" || config.provider === "gitea") && (
            <FieldGroup
              label={t("integrations.syncTime")}
              description={t("integrations.syncTimeDescription")}
              horizontal
            >
              <Toggle
                checked={config.syncTime ?? false}
                onChange={(v) => updateField("syncTime", v)}
                disabled={disabled}
              />
            </FieldGroup>
          )}

          <FieldGroup
            label={t("integrations.autoInsertUrl")}
            description={t("integrations.autoInsertUrlDescription")}
            horizontal
          >
            <Toggle
              checked={config.autoInsertUrl ?? false}
              onChange={(v) => updateField("autoInsertUrl", v)}
              disabled={disabled}
            />
          </FieldGroup>

          <Divider />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTest}
              disabled={!canTest}
              className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-[12px] font-medium text-white
                hover:bg-[var(--accent-hover)] active:opacity-80
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1
                transition-colors"
            >
              {testStatus === "testing"
                ? t("integrations.testing")
                : t("integrations.testConnection")}
            </button>

            {testStatus !== "idle" && testStatus !== "testing" && (
              <span
                className={`flex items-center gap-1.5 text-[12px] ${
                  testStatus === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {testStatus === "success" ? (
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
                {testMessage}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
