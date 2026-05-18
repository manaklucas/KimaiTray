import { Divider, SectionTitle } from "./Controls";

function LinkButton({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        /* TODO: open URL via Tauri opener plugin */
        console.log("open:", href);
      }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-[12px] text-gray-600
        hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800
        focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
        transition-colors w-full text-left"
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
  return (
    <div>
      <SectionTitle>About</SectionTitle>

      <div className="mb-5 rounded-lg bg-gray-50 px-4 py-4 dark:bg-gray-800/50">
        <div className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
          KimaiMate
        </div>
        <div className="text-[12px] text-gray-500 dark:text-gray-400">
          Version 0.1.0
        </div>
        <div className="mt-2 text-[12px] text-gray-400 dark:text-gray-500">
          A free, open-source Kimai time-tracking companion for your menu bar.
          Built with Tauri, React, and TypeScript.
        </div>
      </div>

      <div className="space-y-0.5">
        <LinkButton
          label="GitHub Repository"
          href="https://github.com/engazan/kimaimate"
          icon={<ExternalIcon />}
        />
        <LinkButton
          label="Website"
          href="https://kimaimate.app"
          icon={<ExternalIcon />}
        />
        <LinkButton
          label="Report an Issue"
          href="https://github.com/engazan/kimaimate/issues"
          icon={<ExternalIcon />}
        />
        <LinkButton
          label="Privacy Policy"
          href="https://kimaimate.app/privacy"
          icon={<ExternalIcon />}
        />
      </div>

      <Divider />

      <div className="mt-1">
        <div className="mb-2 text-[13px] font-medium text-gray-700 dark:text-gray-300">
          Support KimaiMate
        </div>
        <p className="mb-3 text-[12px] text-gray-400 dark:text-gray-500">
          KimaiMate is free for everyone — no premium tiers, no paywalls.
          If you find it useful, consider supporting development.
        </p>
        <div className="flex flex-wrap gap-2">
          <DonateButton
            label="Ko-fi"
            color="#FF5E5B"
            onClick={() => console.log("open: ko-fi")}
          />
          <DonateButton
            label="GitHub Sponsors"
            color="#db61a2"
            onClick={() => console.log("open: github sponsors")}
          />
          <DonateButton
            label="Buy Me a Coffee"
            color="#FFDD00"
            textDark
            onClick={() => console.log("open: bmac")}
          />
        </div>
      </div>

      <Divider />

      <div className="text-[11px] text-gray-300 dark:text-gray-600">
        Made with care. © 2025 KimaiMate contributors.
      </div>
    </div>
  );
}

function DonateButton({
  label,
  color,
  textDark,
  onClick,
}: {
  label: string;
  color: string;
  textDark?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity
        hover:opacity-85 active:opacity-75
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400"
      style={{
        backgroundColor: color,
        color: textDark ? "#1a1a1a" : "#ffffff",
      }}
    >
      {label}
    </button>
  );
}
