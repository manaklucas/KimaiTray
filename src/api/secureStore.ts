import { invoke } from "@tauri-apps/api/core";

export async function saveApiToken(
  baseUrl: string,
  token: string,
): Promise<void> {
  if (!baseUrl || !token) return;
  await invoke("save_api_token", { baseUrl, token });
}

export async function getApiToken(
  baseUrl: string,
): Promise<string | null> {
  if (!baseUrl) return null;
  return invoke<string | null>("get_api_token", { baseUrl });
}

export async function deleteApiToken(baseUrl: string): Promise<void> {
  if (!baseUrl) return;
  await invoke("delete_api_token", { baseUrl });
}
