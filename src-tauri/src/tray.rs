use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, PhysicalPosition, WebviewWindow,
};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";

#[tauri::command]
pub fn set_tray_tooltip(app: AppHandle, text: String) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray icon not found")?;
    tray.set_tooltip(Some(&text)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_tray_title(app: AppHandle, title: String) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray icon not found")?;
    // Always pass Some — tray-icon's macOS impl ignores None instead of clearing
    tray.set_title(Some(&title)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_tray_icon(app: AppHandle, state: String) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray icon not found")?;
    let rgba = generate_state_icon(&state);
    let icon = Image::new_owned(rgba, 22, 22);
    tray.set_icon(Some(icon)).map_err(|e| e.to_string())
}

fn generate_state_icon(state: &str) -> Vec<u8> {
    let (r, g, b) = match state {
        "running" => (16, 185, 129),   // emerald-500
        "paused" => (245, 158, 11),    // amber-500
        "error" => (239, 68, 68),      // red-500
        _ => (156, 163, 175),          // gray-400 (idle/disconnected)
    };
    let size: usize = 22;
    let mut pixels = vec![0u8; size * size * 4];
    let center = size as f64 / 2.0;
    let radius = 5.0;
    let outline_r = 7.0;

    for y in 0..size {
        for x in 0..size {
            let dx = x as f64 - center + 0.5;
            let dy = y as f64 - center + 0.5;
            let dist = (dx * dx + dy * dy).sqrt();
            let idx = (y * size + x) * 4;

            if dist <= radius {
                pixels[idx] = r;
                pixels[idx + 1] = g;
                pixels[idx + 2] = b;
                pixels[idx + 3] = 255;
            } else if dist <= outline_r {
                let alpha = ((outline_r - dist) / (outline_r - radius) * 180.0) as u8;
                pixels[idx] = r;
                pixels[idx + 1] = g;
                pixels[idx + 2] = b;
                pixels[idx + 3] = alpha;
            }
        }
    }
    pixels
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

static VIBRANCY_APPLIED: AtomicBool = AtomicBool::new(false);

#[tauri::command]
pub fn set_popup_vibrancy(app: AppHandle, enabled: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("tray-popup")
        .ok_or("Popup not found")?;

    #[cfg(target_os = "macos")]
    if enabled && !VIBRANCY_APPLIED.swap(true, Ordering::SeqCst) {
        use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};
        apply_vibrancy(
            &window,
            NSVisualEffectMaterial::Popover,
            Some(NSVisualEffectState::Active),
            None,
        )
        .map_err(|e| format!("{e}"))?;
    }

    #[cfg(not(target_os = "macos"))]
    let _ = (window, enabled);

    Ok(())
}

#[tauri::command]
pub fn set_popup_corner_radius(app: AppHandle, radius: f64) -> Result<(), String> {
    let window = app
        .get_webview_window("tray-popup")
        .ok_or("Popup not found")?;

    #[cfg(target_os = "macos")]
    {
        use objc::runtime::Object;
        use objc::{class, msg_send, sel, sel_impl};

        window
            .with_webview(move |wv| unsafe {
                let wk: *mut Object = wv.inner() as *mut Object;
                let ns_win: *mut Object = msg_send![wk, window];
                if ns_win.is_null() {
                    return;
                }

                let clear: *mut Object = msg_send![class!(NSColor), clearColor];
                let _: () = msg_send![ns_win, setBackgroundColor: clear];
                let _: () = msg_send![ns_win, setOpaque: false];

                let cv: *mut Object = msg_send![ns_win, contentView];
                let _: () = msg_send![cv, setWantsLayer: true];
                let layer: *mut Object = msg_send![cv, layer];
                let _: () = msg_send![layer, setCornerRadius: radius];
                let _: () = msg_send![layer, setMasksToBounds: true];
            })
            .map_err(|e| format!("{e}"))?;
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (window, radius);
    }

    Ok(())
}

#[tauri::command]
pub fn update_tray_menu(
    app: AppHandle,
    toggle_label: String,
    settings_label: String,
    open_kimai_label: String,
    refresh_label: String,
    quit_label: String,
) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray icon not found")?;
    let menu = build_tray_menu(&app, &toggle_label, &settings_label, &open_kimai_label, &refresh_label, &quit_label)
        .map_err(|e| e.to_string())?;
    tray.set_menu(Some(menu)).map_err(|e| e.to_string())
}

fn build_tray_menu(
    app: &AppHandle,
    toggle_label: &str,
    settings_label: &str,
    open_kimai_label: &str,
    refresh_label: &str,
    quit_label: &str,
) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let toggle_i = MenuItem::with_id(app, "toggle_popup", toggle_label, true, None::<&str>)?;
    let settings_i = MenuItem::with_id(app, "settings", settings_label, true, None::<&str>)?;
    let open_kimai_i = MenuItem::with_id(app, "open_kimai", open_kimai_label, true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", refresh_label, true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", quit_label, true, None::<&str>)?;

    MenuBuilder::new(app)
        .item(&toggle_i)
        .separator()
        .item(&settings_i)
        .item(&open_kimai_i)
        .item(&refresh_i)
        .separator()
        .item(&quit_i)
        .build()
}

pub fn toggle_popup_window(app: &AppHandle) {
    if let Some(popup) = app.get_webview_window("tray-popup") {
        if popup.is_visible().unwrap_or(false) {
            let _ = popup.hide();
        } else {
            let _ = popup.show();
            let _ = popup.set_focus();
        }
    }
}

pub fn show_settings_window(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("settings") {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let toggle_i = MenuItem::with_id(app, "toggle_popup", "Show/Hide", true, None::<&str>)?;
    let settings_i = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let open_kimai_i = MenuItem::with_id(app, "open_kimai", "Open Kimai", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = MenuBuilder::new(app)
        .item(&toggle_i)
        .separator()
        .item(&settings_i)
        .item(&open_kimai_i)
        .item(&refresh_i)
        .separator()
        .item(&quit_i)
        .build()?;

    // Start with idle icon
    let idle_icon = Image::new_owned(generate_state_icon("idle"), 22, 22);

    TrayIconBuilder::with_id("main")
        .icon(idle_icon)
        .tooltip("KimaiTray")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "toggle_popup" => {
                toggle_popup_window(app);
            }
            "settings" => {
                show_settings_window(app);
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
                if let Some(popup) = app.get_webview_window("tray-popup") {
                    let _ = popup.emit("kimai://refresh", ());
                }
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
