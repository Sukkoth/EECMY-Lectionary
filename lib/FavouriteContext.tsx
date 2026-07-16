import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  type FavouriteRow,
  loadFavourites,
  addFavourite as repoAddFavourite,
  removeFavourite as repoRemoveFavourite,
  isFavourite as repoIsFavourite,
  getFavourites,
  clearAll as repoClearAll,
  optimisticAdd as repoOptimisticAdd,
  optimisticRemove as repoOptimisticRemove,
} from "./FavouriteRepository";

type FavouriteContextType = {
  favourites: FavouriteRow[];
  addFavourite: (date: string, order: number) => Promise<void>;
  removeFavourite: (date: string, order: number) => Promise<void>;
  isFavourite: (date: string, order: number) => boolean;
  clearAll: () => Promise<void>;
  optimisticAdd: (date: string, order: number) => void;
  optimisticRemove: (date: string, order: number) => void;
};

const FavouriteContext = createContext<FavouriteContextType | null>(null);

export function FavouriteProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [favourites, setFavourites] = useState<FavouriteRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
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

  const optimisticAdd = useCallback(
    (date: string, order: number) => {
      repoOptimisticAdd(date, order);
      setFavourites([...getFavourites()]);
    },
    [],
  );

  const optimisticRemove = useCallback(
    (date: string, order: number) => {
      repoOptimisticRemove(date, order);
      setFavourites([...getFavourites()]);
    },
    [],
  );

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
      value={{ favourites, addFavourite, removeFavourite, isFavourite, clearAll, optimisticAdd, optimisticRemove }}
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
