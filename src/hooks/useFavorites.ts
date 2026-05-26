import { useState, useEffect, useCallback } from "react";
import type { FavoriteTask } from "../types";
import {
  loadFavorites,
  addFavorite,
  removeFavorite,
} from "../api/favoritesStore";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteTask[]>([]);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  const add = useCallback(async (task: FavoriteTask) => {
    const updated = await addFavorite(task);
    setFavorites(updated);
  }, []);

  const remove = useCallback(async (key: string) => {
    const updated = await removeFavorite(key);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback(
    (key: string) => favorites.some((t) => t.key === key),
    [favorites],
  );

  return { favorites, addFavorite: add, removeFavorite: remove, isFavorite };
}
