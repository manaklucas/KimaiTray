import { useState, useEffect, useCallback } from "react";
import type { FavoriteTask } from "../types";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
} from "../api/favoritesStore";

export function useFavorites(baseUrl: string) {
  const [favorites, setFavorites] = useState<FavoriteTask[]>([]);

  useEffect(() => {
    if (!baseUrl) {
      setFavorites([]);
      return;
    }
    loadFavorites(baseUrl).then(setFavorites);
  }, [baseUrl]);

  const add = useCallback(
    async (task: FavoriteTask) => {
      if (!baseUrl) return;
      const updated = await addFavorite({ ...task, baseUrl });
      setFavorites(updated);
    },
    [baseUrl],
  );

  const remove = useCallback(
    async (key: string) => {
      if (!baseUrl) return;
      const updated = await removeFavorite(key, baseUrl);
      setFavorites(updated);
    },
    [baseUrl],
  );

  const isFavorite = useCallback(
    (key: string) => favorites.some((t) => t.key === key),
    [favorites],
  );

  return { favorites, addFavorite: add, removeFavorite: remove, isFavorite };
}
