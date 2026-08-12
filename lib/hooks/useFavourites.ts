import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import {
  type FavouriteRow,
  type HydratedFavourite,
  addFavourite as repoAdd,
  removeFavourite as repoRemove,
  clearAll as repoClear,
  hydrateFavourites,
} from "../FavouriteRepository";

export const FAVOURITE_KEYS = {
  all: ["favourites"] as const,
  hydrated: (language: string, version: string) =>
    ["favourites", "hydrated", language, version] as const,
};

/** Returns all favourites as raw rows (date, order, createdAt). Lightweight — no reading text joined. */
export function useFavourites() {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: FAVOURITE_KEYS.all,
    queryFn: async (): Promise<FavouriteRow[]> => {
      return db.getAllAsync<FavouriteRow>(
        `SELECT * FROM Favourite ORDER BY createdAt DESC`,
      );
    },
  });
}

/** Returns favourites joined with Reading data (reference, text) for display in the favourites tab. */
export function useHydratedFavourites(language: string, version: string) {
  const db = useSQLiteContext();
  const { data: favourites, isLoading: isRawLoading } = useFavourites();

  const hydratedQuery = useQuery({
    queryKey: FAVOURITE_KEYS.hydrated(language, version),
    enabled: !isRawLoading && favourites !== undefined,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<HydratedFavourite[]> => {
      if (!favourites || favourites.length === 0) return [];
      return hydrateFavourites(db, favourites, language, version);
    },
  });

  const isLoading = (isRawLoading || hydratedQuery.isLoading) && hydratedQuery.data === undefined;

  return {
    ...hydratedQuery,
    data: hydratedQuery.data ?? [],
    isLoading,
  };
}

export function useAddFavourite() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, order }: { date: string; order: number }) => {
      await repoAdd(db, date, order);
    },
    onMutate: async ({ date, order }) => {
      await queryClient.cancelQueries({ queryKey: FAVOURITE_KEYS.all });
      const previous = queryClient.getQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all);
      queryClient.setQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all, (old = []) => [
        { date, order, createdAt: new Date().toISOString() },
        ...old,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVOURITE_KEYS.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: FAVOURITE_KEYS.all, type: "all" });
    },
  });
}

export function useRemoveFavourite() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, order }: { date: string; order: number }) => {
      await repoRemove(db, date, order);
    },
    onMutate: async ({ date, order }) => {
      await queryClient.cancelQueries({ queryKey: FAVOURITE_KEYS.all });
      const previousRaw = queryClient.getQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all);
      const previousHydrated = queryClient.getQueriesData<HydratedFavourite[]>({
        queryKey: ["favourites", "hydrated"],
      });

      queryClient.setQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all, (old = []) =>
        old.filter((f) => !(f.date === date && f.order === order)),
      );

      queryClient.setQueriesData<HydratedFavourite[]>(
        { queryKey: ["favourites", "hydrated"] },
        (old = []) => old?.filter((f) => !(f.date === date && f.order === order)) ?? [],
      );

      return { previousRaw, previousHydrated };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRaw) {
        queryClient.setQueryData(FAVOURITE_KEYS.all, context.previousRaw);
      }
      if (context?.previousHydrated) {
        context.previousHydrated.forEach(([key, val]) => {
          queryClient.setQueryData(key, val);
        });
      }
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: FAVOURITE_KEYS.all, type: "all" });
    },
  });
}

export function useClearFavourites() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await repoClear(db);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: FAVOURITE_KEYS.all });
      const previousRaw = queryClient.getQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all);
      const previousHydrated = queryClient.getQueriesData<HydratedFavourite[]>({
        queryKey: ["favourites", "hydrated"],
      });

      queryClient.setQueryData<FavouriteRow[]>(FAVOURITE_KEYS.all, []);
      queryClient.setQueriesData<HydratedFavourite[]>(
        { queryKey: ["favourites", "hydrated"] },
        () => [],
      );

      return { previousRaw, previousHydrated };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRaw) {
        queryClient.setQueryData(FAVOURITE_KEYS.all, context.previousRaw);
      }
      if (context?.previousHydrated) {
        context.previousHydrated.forEach(([key, val]) => {
          queryClient.setQueryData(key, val);
        });
      }
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: FAVOURITE_KEYS.all, type: "all" });
    },
  });
}
