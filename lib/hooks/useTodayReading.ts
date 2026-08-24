import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { ReadingsDB, toDateString, type DayData } from "../database";
import { READING_KEYS } from "./useReading";

export function useTodayReading(
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
