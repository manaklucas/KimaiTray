use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, WebviewWindow,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";

#[tauri::command]
pub fn set_tray_tooltip(app: AppHandle, text: String) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray icon not found")?;
    tray.set_tooltip(Some(&text)).map_err(|e| e.to_string())
}

static LAST_POPUP_HIDE: AtomicU64 = AtomicU64::new(0);

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

pub fn on_popup_blur(window: &tauri::Window) {
    LAST_POPUP_HIDE.store(now_ms(), Ordering::SeqCst);
    let _ = window.hide();
}

fn position_popup(window: &WebviewWindow, tray_rect: &tauri::Rect) -> tauri::Result<()> {
    let scale = window.scale_factor().unwrap_or(1.0);
    let win_size = window.outer_size()?;

    let tray_pos: PhysicalPosition<i32> = tray_rect.position.to_physical(scale);
    let tray_size: tauri::PhysicalSize<i32> = tray_rect.size.to_physical(scale);

    let x = tray_pos.x + tray_size.width / 2 - win_size.width as i32 / 2;

    #[cfg(target_os = "macos")]
    let y = tray_pos.y + tray_size.height;

    #[cfg(not(target_os = "macos"))]
    let y = tray_pos.y - win_size.height as i32;

    window.set_position(PhysicalPosition::new(x, y))?;
    Ok(())
}

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let settings_i = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let open_kimai_i = MenuItem::with_id(app, "open_kimai", "Open Kimai", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = MenuBuilder::new(app)
        .item(&settings_i)
        .item(&open_kimai_i)
        .item(&refresh_i)
        .separator()
        .item(&quit_i)
        .build()?;

    TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("KimaiMate")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "settings" => {
                let handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    if let Some(w) = handle.get_webview_window("settings") {
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
                });
            }
            "open_kimai" => {
                let handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(store) = handle.store(STORE_PATH) {
                        if let Some(serde_json::Value::Object(s)) = store.get("settings") {
                            if let Some(serde_json::Value::String(url)) = s.get("kimaiUrl") {
                                if !url.is_empty() {
                                    let _ = handle.opener().open_url(url, None::<&str>);
                                }
                            }
                        }
                    }
                });
            }
            "refresh" => {
                // TODO: refresh data from Kimai API
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(popup) = app.get_webview_window("tray-popup") {
                    if popup.is_visible().unwrap_or(false) {
                        let _ = popup.hide();
                    } else {
                        if now_ms() - LAST_POPUP_HIDE.load(Ordering::SeqCst) < 300 {
                            return;
                        }
                        let _ = position_popup(&popup, &rect);
                        let _ = popup.show();
                        let _ = popup.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
