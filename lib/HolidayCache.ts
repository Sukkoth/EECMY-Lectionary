import type { SQLiteDatabase } from "expo-sqlite";
import type { HolidayRow } from "./types";

let cache: HolidayRow[] | null = null;
let cacheLanguage = "";
const loadPromises = new Map<string, Promise<void>>();

export async function ensureHolidaysLoaded(
  db: SQLiteDatabase,
  language: string,
): Promise<void> {
  if (cache !== null && cacheLanguage === language) {
    return;
  }

  const existing = loadPromises.get(language);
  if (existing) return existing;

  const promise = db
    .getAllAsync<HolidayRow>(
      "SELECT * FROM Holiday WHERE language = ? ORDER BY date",
      [language],
    )
    .then((rows) => {
      cache = rows.map((row) => ({ ...row, type: row.type.toLowerCase() as HolidayRow["type"] }));
      cacheLanguage = language;
      loadPromises.delete(language);
    })
    .catch((err) => {
      loadPromises.delete(language);
      throw err;
    });

  loadPromises.set(language, promise);
  return promise;
}

export function clearCache(): void {
  cache = null;
  cacheLanguage = "";
  loadPromises.clear();
}

export function getHolidaysForMonth(
  year: number,
  month: number,
): Map<string, HolidayRow[]> {
  const map = new Map<string, HolidayRow[]>();
  if (!cache) return map;
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  for (const row of cache) {
    if (row.date.startsWith(prefix)) {
      const existing = map.get(row.date) ?? [];
      existing.push(row);
      map.set(row.date, existing);
    }
  }
  return map;
}

export function getHolidaysListForMonth(
  year: number,
  month: number,
): HolidayRow[] {
  if (!cache) return [];
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  return cache.filter((h) => h.date.startsWith(prefix));
}
