import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import type { HolidayRow } from "../types";

export const HOLIDAY_KEYS = {
  all: ["holidays"] as const,
  language: (language: string) => ["holidays", language] as const,
};

export function useHolidays(language: string) {
  const db = useSQLiteContext();

  return useQuery({
    queryKey: HOLIDAY_KEYS.language(language),
    queryFn: async (): Promise<HolidayRow[]> => {
      const rows = await db.getAllAsync<HolidayRow>(
        "SELECT * FROM Holiday WHERE language = ? ORDER BY date",
        [language],
      );
      return rows.map((row) => ({
        ...row,
        type: row.type.toLowerCase() as HolidayRow["type"],
      }));
    },
  });
}

export function getHolidaysForMonth(
  holidays: HolidayRow[] | undefined,
  year: number,
  month: number,
): Map<string, HolidayRow[]> {
  const map = new Map<string, HolidayRow[]>();
  if (!holidays) return map;
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  for (const row of holidays) {
    if (row.date.startsWith(prefix)) {
      const existing = map.get(row.date) ?? [];
      existing.push(row);
      map.set(row.date, existing);
    }
  }
  return map;
}

export function getHolidaysListForMonth(
  holidays: HolidayRow[] | undefined,
  year: number,
  month: number,
): HolidayRow[] {
  if (!holidays) return [];
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return holidays.filter((h) => h.date.startsWith(prefix));
}
