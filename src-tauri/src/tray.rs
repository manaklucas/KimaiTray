use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, WebviewWindow,
};

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
    let win_size = window.outer_size()?;

    let tray_x = tray_rect.position.x;
    let tray_w = tray_rect.size.width;

    let x = (tray_x + tray_w / 2.0 - win_size.width as f64 / 2.0) as i32;

    #[cfg(target_os = "macos")]
    let y = (tray_rect.position.y + tray_rect.size.height) as i32;

    #[cfg(not(target_os = "macos"))]
    let y = (tray_rect.position.y - win_size.height as f64) as i32;

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

    TrayIconBuilder::new()
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("KimaiMate")
        .menu(&menu)
        .menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "settings" => {
                if let Some(w) = app.get_webview_window("settings") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "open_kimai" => {
                // TODO: open configured Kimai URL in default browser
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
