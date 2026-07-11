import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  type FavouriteRow,
  ensureFavouriteTable,
  loadFavourites,
  addFavourite as repoAddFavourite,
  removeFavourite as repoRemoveFavourite,
  isFavourite as repoIsFavourite,
  getFavourites,
  clearAll as repoClearAll,
} from "./FavouriteRepository";

type FavouriteContextType = {
  favourites: FavouriteRow[];
  addFavourite: (date: string, order: number) => Promise<void>;
  removeFavourite: (date: string, order: number) => Promise<void>;
  isFavourite: (date: string, order: number) => boolean;
  clearAll: () => Promise<void>;
};

const FavouriteContext = createContext<FavouriteContextType | null>(null);

export function FavouriteProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [favourites, setFavourites] = useState<FavouriteRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await ensureFavouriteTable(db);
        await loadFavourites(db);
        if (!cancelled) {
          setFavourites([...getFavourites()]);
        }
      } catch {
        console.warn("Failed to load favourites — continuing without them");
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const addFavourite = useCallback(
    async (date: string, order: number) => {
      await repoAddFavourite(db, date, order);
      setFavourites([...getFavourites()]);
    },
    [db],
  );

  const removeFavourite = useCallback(
    async (date: string, order: number) => {
      await repoRemoveFavourite(db, date, order);
      setFavourites([...getFavourites()]);
    },
    [db],
  );

  const isFavourite = useCallback(
    (date: string, order: number) => repoIsFavourite(date, order),
    [],
  );

  const clearAll = useCallback(async () => {
    await repoClearAll(db);
    setFavourites([]);
  }, [db]);

  return (
    <FavouriteContext.Provider
      value={{ favourites, addFavourite, removeFavourite, isFavourite, clearAll }}
    >
      {children}
    </FavouriteContext.Provider>
  );
}

export function useFavourite(): FavouriteContextType {
  const ctx = useContext(FavouriteContext);
  if (!ctx) throw new Error("useFavourite must be used within a FavouriteProvider");
  return ctx;
}
