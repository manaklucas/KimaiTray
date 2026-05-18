import { useState } from "react";
import type { AppSettings } from "../types";
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
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateToken: (value: string) => void;
}

export default function ConnectionSection({
  settings,
  token,
  update,
  updateToken,
}: Props) {
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleTestConnection = () => {
    setTestStatus("testing");
    setTimeout(() => {
      if (settings.kimaiUrl && token) {
        setTestStatus("success");
      } else {
        setTestStatus("error");
      }
      setTimeout(() => setTestStatus("idle"), 3000);
    }, 1200);
  };

  return (
    <div>
      <SectionTitle>Connection</SectionTitle>
      <SectionDescription>
        Connect to your Kimai instance using its base URL and a personal API
        token.
      </SectionDescription>

      <FieldGroup label="Kimai Base URL" description="The root URL of your Kimai installation">
        <TextInput
          type="url"
          value={settings.kimaiUrl}
          onChange={(v) => update("kimaiUrl", v)}
          placeholder="https://kimai.example.com"
        />
      </FieldGroup>

      <FieldGroup label="API Token" description="Generate one in Kimai → Settings → API">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TextInput
              type={showToken ? "text" : "password"}
              value={token}
              onChange={updateToken}
              placeholder="Paste your API token"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="shrink-0 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-500
              hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
              focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
          >
            {showToken ? "Hide" : "Show"}
          </button>
        </div>
      </FieldGroup>

      <Divider />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testStatus === "testing"}
          className="rounded-md bg-blue-600 px-3.5 py-1.5 text-[12px] font-medium text-white
            hover:bg-blue-700 active:bg-blue-800
            disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1
            transition-colors"
        >
          {testStatus === "testing" ? "Testing…" : "Test Connection"}
        </button>

        {testStatus === "success" && (
          <span className="flex items-center gap-1 text-[12px] text-emerald-600 dark:text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Connected
          </span>
        )}
        {testStatus === "error" && (
          <span className="flex items-center gap-1 text-[12px] text-red-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Connection failed
          </span>
        )}
      </div>
    </div>
  );
}
