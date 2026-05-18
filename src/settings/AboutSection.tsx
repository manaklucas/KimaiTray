import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Divider, SectionTitle } from "./Controls";

function LinkButton({
  label,
  href,
  icon,
  disabled,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) openUrl(href).catch(() => {}); }}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-[12px]
        focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
        transition-colors w-full text-left
        ${disabled
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ExternalIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <div>
      <SectionTitle>{t("aboutSection.title")}</SectionTitle>

      <div className="mb-5 rounded-lg bg-gray-50 px-4 py-4 dark:bg-gray-800/50">
        <div className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
          {t("aboutSection.appName")}
        </div>
        <div className="text-[12px] text-gray-500 dark:text-gray-400">
          {t("aboutSection.version", { version: "0.1.0" })}
        </div>
        <div className="mt-2 text-[12px] text-gray-400 dark:text-gray-500">
          {t("aboutSection.appDescription")}
        </div>
      </div>

      <div className="space-y-0.5">
        <LinkButton
          label={t("aboutSection.githubRepo")}
          href="https://github.com/engazan/kimaimate"
          icon={<ExternalIcon />}
          disabled
        />
        <LinkButton
          label={t("aboutSection.website")}
          href="https://kimaimate.app"
          icon={<ExternalIcon />}
          disabled
        />
        <LinkButton
          label={t("aboutSection.reportIssue")}
          href="https://github.com/engazan/kimaimate/issues"
          icon={<ExternalIcon />}
          disabled
        />
        <LinkButton
          label={t("aboutSection.privacyPolicy")}
          href="https://kimaimate.app/privacy"
          icon={<ExternalIcon />}
          disabled
        />
      </div>

      <Divider />

      <div className="mt-1">
        <div className="mb-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
          {t("aboutSection.supportTitle")}
        </div>
        <p className="mb-3 text-[12px] text-gray-400 dark:text-gray-500">
          {t("aboutSection.supportDescription")}
        </p>
        <div className="flex flex-wrap gap-2">
          <DonateButton
            label="Ko-fi"
            color="#FF5E5B"
            onClick={() => openUrl("https://ko-fi.com/kimaimate").catch(() => {})}
            disabled
          />
          <DonateButton
            label="GitHub Sponsors"
            color="#db61a2"
            onClick={() => openUrl("https://github.com/sponsors/engazan").catch(() => {})}
          />
          <DonateButton
            label="Buy Me a Coffee"
            color="#FFDD00"
            textDark
            onClick={() => openUrl("https://buymeacoffee.com/kimaimate").catch(() => {})}
            disabled
          />
        </div>
      </div>

      <Divider />

      <div className="text-[11px] text-gray-300 dark:text-gray-600">
        {t("aboutSection.copyright")}
      </div>
    </div>
  );
}

function DonateButton({
  label,
  color,
  textDark,
  onClick,
  disabled,
}: {
  label: string;
  color: string;
  textDark?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-85 active:opacity-75"}`}
      style={{
        backgroundColor: color,
        color: textDark ? "#1a1a1a" : "#ffffff",
      }}
    >
      {label}
    </button>
  );
}
