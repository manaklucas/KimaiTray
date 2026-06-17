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

export async function loadFavorites(baseUrl: string): Promise<FavoriteTask[]> {
  try {
    const store = await getStore();
    const all = (await store.get<FavoriteTask[]>(KEY)) ?? [];

    // Migrate legacy unscoped favorites onto the current connection so users
    // don't lose favorites created before per-connection scoping existed.
    if (baseUrl && all.some((t) => !t.baseUrl)) {
      const migrated = all.map((t) => (t.baseUrl ? t : { ...t, baseUrl }));
      await store.set(KEY, migrated);
      await store.save();
      return migrated.filter((t) => t.baseUrl === baseUrl);
    }

    return all.filter((t) => t.baseUrl === baseUrl);
  } catch {
    return [];
  }
}

export async function addFavorite(task: FavoriteTask): Promise<FavoriteTask[]> {
  const store = await getStore();
  const current = (await store.get<FavoriteTask[]>(KEY)) ?? [];
  if (current.some((t) => t.key === task.key && t.baseUrl === task.baseUrl)) {
    return current.filter((t) => t.baseUrl === task.baseUrl);
  }
  const updated = [...current, task];
  await store.set(KEY, updated);
  await store.save();
  return updated.filter((t) => t.baseUrl === task.baseUrl);
}

export async function removeFavorite(
  key: string,
  baseUrl: string,
): Promise<FavoriteTask[]> {
  const store = await getStore();
  const current = (await store.get<FavoriteTask[]>(KEY)) ?? [];
  const updated = current.filter(
    (t) => !(t.key === key && t.baseUrl === baseUrl),
  );
  await store.set(KEY, updated);
  await store.save();
  return updated.filter((t) => t.baseUrl === baseUrl);
}

/**
 * Move all favorites scoped to `fromBaseUrl` onto `toBaseUrl`.
 * Favorites already present on the destination (same key) are not duplicated.
 * Returns the number of favorites moved.
 */
export async function moveFavorites(
  fromBaseUrl: string,
  toBaseUrl: string,
): Promise<number> {
  if (!fromBaseUrl || !toBaseUrl || fromBaseUrl === toBaseUrl) return 0;
  const store = await getStore();
  const all = (await store.get<FavoriteTask[]>(KEY)) ?? [];
  const moving = all.filter((t) => t.baseUrl === fromBaseUrl);
  if (moving.length === 0) return 0;

  const destKeys = new Set(
    all.filter((t) => t.baseUrl === toBaseUrl).map((t) => t.key),
  );
  const updated = all
    // Drop source favorites whose key already exists on the destination.
    .filter((t) => !(t.baseUrl === fromBaseUrl && destKeys.has(t.key)))
    // Re-scope the rest onto the destination connection.
    .map((t) => (t.baseUrl === fromBaseUrl ? { ...t, baseUrl: toBaseUrl } : t));

  await store.set(KEY, updated);
  await store.save();
  return moving.length;
}
