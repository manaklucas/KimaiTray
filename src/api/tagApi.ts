import type { KimaiClient } from "./kimaiClient";

export interface KimaiTag {
  name: string;
  color: string | null;
}

/**
 * Returns existing Kimai tags with their colors.
 * Prefers GET /api/tags/find (entities incl. color); an empty `name` filter
 * matches all tags. Falls back to GET /api/tags (names only) on older servers.
 */
export async function getTags(client: KimaiClient): Promise<KimaiTag[]> {
  try {
    const data = await client.get<unknown>("/api/tags/find", { name: "" });
    if (Array.isArray(data)) {
      const mapped = data
        .map((t) => {
          const obj = t as { name?: unknown; color?: unknown };
          return {
            name: typeof obj?.name === "string" ? obj.name : "",
            color: typeof obj?.color === "string" ? obj.color : null,
          };
        })
        .filter((t) => t.name.length > 0);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    // Older Kimai without /api/tags/find — fall back to names only.
  }

  const names = await client.get<unknown>("/api/tags");
  if (!Array.isArray(names)) return [];
  return names
    .map((t) => (typeof t === "string" ? t : String((t as { name?: unknown })?.name ?? "")))
    .filter((name) => name.length > 0)
    .map((name) => ({ name, color: null }));
}
