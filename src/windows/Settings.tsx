import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Settings() {
  return (
    <div className="h-screen w-screen bg-white p-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="mb-6 text-lg font-bold">Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kimai URL</label>
          <input
            type="url"
            placeholder="https://your-kimai-instance.com"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">API Token</label>
          <input
            type="password"
            placeholder="Your API token"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Save
        </button>
        <button
          onClick={() => getCurrentWindow().hide()}
          className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
