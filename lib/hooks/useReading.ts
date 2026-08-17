import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { ReadingsDB, toDateString, type DayData } from "../database";

export const READING_KEYS = {
  all: ["readings"] as const,
  byDate: (date: string, language: string, version: string) =>
    ["readings", date, language, version] as const,
};

function useReading(
  date: Date,
  language: string,
  version: string,
) {
  const db = useSQLiteContext();
  const dateStr = toDateString(date);

  return useQuery({
    queryKey: READING_KEYS.byDate(dateStr, language, version),
    queryFn: async (): Promise<DayData | null> => {
      const readingsDB = new ReadingsDB(db);
      return readingsDB.getReadingsForDate(date, language, version);
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

export function usePrefetchReadings() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useCallback(
    (dates: Date[], language: string, version: string) => {
      for (const date of dates) {
        const dateStr = toDateString(date);
        const key = READING_KEYS.byDate(dateStr, language, version);
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: async (): Promise<DayData | null> => {
            const readingsDB = new ReadingsDB(db);
            return readingsDB.getReadingsForDate(date, language, version);
          },
          staleTime: Infinity,
          gcTime: 1000 * 60 * 30,
        });
      }
    },
    [db, queryClient],
  );
}
