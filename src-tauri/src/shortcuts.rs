use log::{error, info};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_store::StoreExt;

use crate::tray;

const STORE_PATH: &str = "settings.json";

#[tauri::command]
pub fn register_shortcuts(
    app: AppHandle,
    toggle_popup: String,
    start_stop_timer: String,
    open_settings: String,
) -> Result<(), String> {
    let gs = app.global_shortcut();
    gs.unregister_all().map_err(|e| e.to_string())?;

    if !toggle_popup.is_empty() {
        let handle = app.clone();
        gs.on_shortcut(toggle_popup.as_str(), move |_app, _shortcut, _event| {
            tray::toggle_popup_window(&handle);
        })
        .map_err(|e| format!("Toggle popup shortcut: {e}"))?;
        info!("Registered toggle-popup shortcut: {toggle_popup}");
    }

    if !start_stop_timer.is_empty() {
        let handle = app.clone();
        gs.on_shortcut(start_stop_timer.as_str(), move |_app, _shortcut, _event| {
            if let Some(popup) = handle.get_webview_window("tray-popup") {
                let _ = popup.emit("kimai://toggle-timer", ());
            }
        })
        .map_err(|e| format!("Start/stop timer shortcut: {e}"))?;
        info!("Registered start-stop-timer shortcut: {start_stop_timer}");
    }

    if !open_settings.is_empty() {
        let handle = app.clone();
        gs.on_shortcut(open_settings.as_str(), move |_app, _shortcut, _event| {
            tray::show_settings_window(&handle);
        })
        .map_err(|e| format!("Open settings shortcut: {e}"))?;
        info!("Registered open-settings shortcut: {open_settings}");
    }

    Ok(())
}

pub fn register_from_store(app: &AppHandle) {
    let (toggle, timer, settings) = match app.store(STORE_PATH) {
        Ok(store) => {
            let s = store
                .get("settings")
                .and_then(|v| v.as_object().cloned())
                .unwrap_or_default();
            let get = |key: &str| {
                s.get(key)
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string()
            };
            (
                get("shortcutTogglePopup"),
                get("shortcutStartStopTimer"),
                get("shortcutOpenSettings"),
            )
        }
        Err(_) => return,
    };

    if toggle.is_empty() && timer.is_empty() && settings.is_empty() {
        return;
    }

    if let Err(e) = register_shortcuts(app.clone(), toggle, timer, settings) {
        error!("Failed to register shortcuts from store: {e}");
    }
}
