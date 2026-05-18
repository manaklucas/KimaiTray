mod idle;
mod keychain;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
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
            idle::get_idle_seconds,
        ])
        .setup(|app| {
            tray::create_tray(app.handle())?;
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
        .expect("error while running tauri application");
}
