import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { ReadingsDB, toDateString, type DayData } from "../database";

const READING_KEYS = {
  all: ["readings"] as const,
  today: (date: string, language: string, version: string) =>
    ["readings", "today", date, language, version] as const,
};

export function useTodayReading(
  date: Date,
  language: string,
  version: string,
) {
  const db = useSQLiteContext();
  const dateStr = toDateString(date);

  return useQuery({
    queryKey: READING_KEYS.today(dateStr, language, version),
    queryFn: async (): Promise<DayData | null> => {
      const readingsDB = new ReadingsDB(db);
      return readingsDB.getReadingsForDate(date, language, version);
    },
  });
}
