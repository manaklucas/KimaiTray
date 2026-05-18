use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_PATH: &str = "settings.json";
const TOKEN_PREFIX: &str = "api-token:";

fn token_key(base_url: &str) -> String {
    format!("{TOKEN_PREFIX}{}", base_url.trim_end_matches('/'))
}

#[tauri::command]
pub async fn save_api_token(app: AppHandle, base_url: String, token: String) -> Result<(), String> {
    if base_url.is_empty() || token.is_empty() {
        return Err("URL and token must not be empty".into());
    }
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    store.set(token_key(&base_url), serde_json::Value::String(token));
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_api_token(app: AppHandle, base_url: String) -> Result<Option<String>, String> {
    if base_url.is_empty() {
        return Ok(None);
    }
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    match store.get(token_key(&base_url)) {
        Some(serde_json::Value::String(t)) => Ok(Some(t)),
        _ => Ok(None),
    }
}

#[tauri::command]
pub async fn delete_api_token(app: AppHandle, base_url: String) -> Result<(), String> {
    if base_url.is_empty() {
        return Ok(());
    }
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    store.delete(token_key(&base_url));
    store.save().map_err(|e| e.to_string())
}
