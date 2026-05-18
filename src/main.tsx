import React from "react";
import ReactDOM from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initPromise } from "./shared/i18n";
import QueryProvider from "./providers/QueryProvider";
import TrayPopup from "./windows/TrayPopup";
import Settings from "./windows/Settings";
import "./index.css";

const label = getCurrentWindow().label;
document.documentElement.dataset.window = label;

function App() {
  switch (label) {
    case "settings":
      return <Settings />;
    case "tray-popup":
    default:
      return (
        <QueryProvider>
          <TrayPopup />
        </QueryProvider>
      );
  }
}

initPromise.then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
