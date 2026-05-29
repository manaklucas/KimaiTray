mod idle;
mod keychain;
mod shortcuts;
mod tray;

use log::{error, info};
use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let default_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        let payload = if let Some(s) = info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic".to_string()
        };
        let location = info
            .location()
            .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
            .unwrap_or_else(|| "unknown".to_string());
        eprintln!("PANIC at {location}: {payload}");
        error!("PANIC at {location}: {payload}");
        default_hook(info);
    }));

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .level(if cfg!(debug_assertions) {
                    log::LevelFilter::Debug
                } else {
                    log::LevelFilter::Info
                })
                .level_for("tauri_plugin_updater", log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            keychain::save_api_token,
            keychain::get_api_token,
            keychain::delete_api_token,
            tray::set_tray_tooltip,
            tray::set_tray_title,
            tray::set_tray_icon,
            tray::set_popup_vibrancy,
            tray::set_popup_size,
            tray::set_popup_corner_radius,
            tray::update_tray_menu,
            tray::set_tray_click_actions,
            tray::set_display_mode,
            tray::set_always_on_top,
            tray::start_tray_ticker,
            tray::stop_tray_ticker,
            tray::list_monitors,
            tray::set_popup_monitor,
            idle::get_idle_seconds,
            shortcuts::register_shortcuts,
        ])
        .setup(|app| {
            info!(
                "KimaiTray v{} starting",
                app.config().version.as_deref().unwrap_or("unknown")
            );
            tray::create_tray(app.handle())?;
            info!("System tray created");
            if tray::is_detached() {
                if let Some(w) = app.handle().get_webview_window("tray-popup") {
                    let _ = w.set_resizable(true);
                    let _ = w.set_always_on_top(false);
                    #[cfg(not(target_os = "linux"))]
                    let _ = w.set_skip_taskbar(false);
                    let _ = w.center();
                    let _ = w.show();
                }
            }
            shortcuts::register_from_store(app.handle());
            Ok(())
        })
        .on_window_event(|window, event| match window.label() {
            "tray-popup" => {
                if let tauri::WindowEvent::Focused(false) = event {
                    tray::on_popup_blur(window);
                }
            }
            "settings" => {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            eprintln!("Fatal: failed to start KimaiTray: {e}");
            std::process::exit(1);
        });
}
