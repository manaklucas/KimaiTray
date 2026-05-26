import { load } from "@tauri-apps/plugin-store";
import type { FavoriteTask } from "../types";

const STORE_PATH = "settings.json";
const KEY = "favoriteTasks";

let storePromise: ReturnType<typeof load> | null = null;

function getStore() {
  if (!storePromise) {
    storePromise = load(STORE_PATH, { defaults: {}, autoSave: true });
  }
  return storePromise;
}

export async function loadFavorites(): Promise<FavoriteTask[]> {
  try {
    const store = await getStore();
    return (await store.get<FavoriteTask[]>(KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function addFavorite(task: FavoriteTask): Promise<FavoriteTask[]> {
  const store = await getStore();
  const current = (await store.get<FavoriteTask[]>(KEY)) ?? [];
  if (current.some((t) => t.key === task.key)) return current;
  const updated = [...current, task];
  await store.set(KEY, updated);
  await store.save();
  return updated;
}

export async function removeFavorite(key: string): Promise<FavoriteTask[]> {
  const store = await getStore();
  const current = (await store.get<FavoriteTask[]>(KEY)) ?? [];
  const updated = current.filter((t) => t.key !== key);
  await store.set(KEY, updated);
  await store.save();
  return updated;
}
